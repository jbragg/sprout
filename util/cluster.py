"""Utility to add vector and cluster information to items based on worker
answers"""
from __future__ import print_function
import argparse
import collections
import cPickle as pickle
import json
import os

import Algorithmia
import numpy as np
import pandas as pd
from sklearn import cluster
from sklearn.feature_extraction.text import TfidfVectorizer


def get_word_vectors(words):
    """Get word vectors.

    Args:
        words ([str]): Words.

    Returns:
        dict: Mapping from word to vector (or None).

    """
    client = Algorithmia.client(os.environ['ALGORITHMIA_KEY'])
    algo = client.algo('jbragg/word2vec/0.1.1')
    resp = algo.pipe(dict(getVecFromWord=list(set(words)))).result
    return dict((v['word'], v['vector']) for v in resp['vecFromWord'])


def cluster_docs(docs, cached_filename=None, cluster_method='affinity',
                 connectivity=None, k=20):
    """Get clusters.

    Args:
        docs (pd.Series): Series with index.
        cached_filename (Optional[str]): Path to file for caching word vectors.
        cluster_method (Optional[str]): Cluster method. Can be one of:
            'kmeans' or 'affinity'.

    Returns:
        clusters ([[Object]]): Clusters of ids.
        exemplars ([Object]): Representative ids (one per cluster).
        embeddings (dict): Mapping from id (Object) to vector ([float]).

    """
    vectorizor = TfidfVectorizer(
        input='content',
        stop_words='english',
    )
    doc_word_matrix = vectorizor.fit_transform(docs)
    words = vectorizor.get_feature_names()

    cached = cached_filename and os.path.exists(cached_filename)
    if cached:
        with open(cached_filename, 'rb') as f:
            word_vectors = pickle.load(f)
    else:
        word_vectors = get_word_vectors(words)
        if cached_filename:
            with open(cached_filename, 'wb') as f:
                pickle.dump(word_vectors, f)

    embedding_dim = len(next(
        x for x in word_vectors.itervalues() if x is not None
    ))
    transform = np.matrix(
        [word_vectors[w] if w in word_vectors and word_vectors[w]
         else np.zeros(embedding_dim)
         for w in words]
    )
    doc_feature_matrix = doc_word_matrix * transform
    if any(np.allclose(v, np.zeros(embedding_dim))
           for v in doc_feature_matrix.tolist()):
        raise Exception('No embedding for a question. What to do?')

    ids = docs.index
    clusters = collections.defaultdict(list)
    if cluster_method == 'kmeans':
        model = cluster.KMeans(n_clusters=min(k, doc_feature_matrix.shape[0]))
    elif cluster_method == 'affinity':
        model = cluster.AffinityPropagation()
    else:
        model = cluster.AgglomerativeClustering()
        raise NotImplementedError
    Y = model.fit_predict(doc_feature_matrix)
    for id, y in zip(ids, Y):
        clusters[y].append(id)
    try:
        exemplars = [ids[x] for x in model.cluster_centers_indices_]
    except AttributeError:
        exemplars = []

    embeddings = dict()
    for id, vector in zip(ids, doc_feature_matrix.tolist()):
        embeddings[id] = vector

    return (
        [clusters[x] for x in sorted(clusters)],
        exemplars,
        embeddings,
    )


def _concatenate_df_reasons(df):
    """Return text from unclear reasons."""
    all_words = ''

    def concat_series(ser):
        return ser.fillna('').str.cat(sep=' ') or ''
    for ser in [
        df.unclear_type,
        df.unclear_reason,
        df.data.map(lambda d: d.get('instructions') or d.get('test') or '')
    ]:
        words = concat_series(ser)
        if words:
            all_words += ' {}'.format(words.strip())
    return all_words.strip()


def cluster_questions(df, cached_filename=None):
    """Cluster questions.

    Args:
        df (pd.DataFrame):
        cached_filename (Optional[str]): Path to file for caching word vectors.

    Returns:
        clusters ([[int]]): Clusters of questionids.
        exemplars ([int]): Representative questionids (one per cluster).
        other ([int]): Unclustered questionids.
        embeddings (dict): Mapping from questionid (int) to vector ([float]).

    """
    questions = df.groupby(
        'questionid').apply(_concatenate_df_reasons).sort_index()
    questions = questions.where(questions.map(lambda x: len(x) > 0)).dropna()
    clusters, exemplars, embeddings = cluster_docs(
        questions, cached_filename=cached_filename
    )
    questionids = questions.index
    questionids_other = set(df.questionid.unique()).difference(questionids)
    return (
        clusters,
        exemplars,
        questionids_other,
        embeddings,
    )


def main(answers_path, experiment_path, out_path, cached_filename=None):
    """Create new experiment file with item cluster information.

    Simply copies file if no information in 'unclear_reason' or 'unclear_type'.

    Args:
        answers_path (str): Path to answers data file.
        experiment_path (str): Path to experiment file.
        out_path (str): Path to augmented experiment file.
        cached_filename (Optional[str]): Path to cached vocabulary file.
            Defaults to '{raw_path}.pickle.CACHED'

    """
    if cached_filename is None:
        cached_filename = os.path.basename(answers_path) + '.pickle.CACHED'
    df = pd.read_json(answers_path, orient='records')
    def has_string(v):
        return pd.notnull(v) and v
    def filter1(row):
        """Select questions with reasons for clustering."""
        return bool(
            has_string(row.get('unclear_reason'))
            or has_string(row.get('unclear_type'))
            or has_string(row['data'].get('instructions'))
            or has_string(row['data'].get('test'))
        )
    questions = df[df.apply(filter1, axis=1)]['questionid'].unique()
    df_filtered = df[df.questionid.isin(questions)]
    clusters, exemplars, questionids_other, embeddings = cluster_questions(
        df_filtered, cached_filename=cached_filename)
    question_to_cluster = dict()
    for i, clust in enumerate(clusters):
        for questionid in clust:
            question_to_cluster[questionid] = i

    with open(experiment_path, 'r') as f:
        experiment = json.load(f)
    for item in experiment['data']:
        questionid = item['id']
        item['cluster'] = question_to_cluster[
            questionid] if questionid in question_to_cluster else -1
        if questionid in embeddings:
            item['vector'] = embeddings[questionid]
        if questionid in exemplars:
            item['exemplar'] = True

    with open(out_path, 'w') as f:
        json.dump(experiment, f)


def main_simple(raw_path, out_path=None, cached_filename=None):
    """Simple interface for clustering arbitrary text.

    Args:
        raw_path (str): Path to csv-formatted file, with the following
            columns:
            - id (Optional[str]): Ids.
            - doc (str): Documents.
        out_path (Optional[str]): Path to output csv file with 'cluster'
            column.
            Defaults to '{raw_path}.clustered.csv'
        cached_filename (Optional[str]): Path to cached vocabulary file.
            Defaults to '{raw_path}.pickle.CACHED'

    """
    if cached_filename is None:
        cached_filename = os.path.join(
            os.path.dirname(raw_path),
            os.path.basename(raw_path) + '.pickle.CACHED',
        )
    if out_path is None:
        out_path = os.path.join(
            os.path.dirname(raw_path),
            os.path.basename(raw_path) + '.clustered.csv',
        )
    df = pd.read_csv(raw_path)
    docs = df['doc']
    clusters, _, _ = cluster_docs(
        docs,
        cached_filename=cached_filename,
    )
    for i, ids in enumerate(clusters):
        for id in ids:
            df.ix[id, 'cluster'] = i
    df['cluster'] = df['cluster'].astype(int)
    for _, df2 in df.groupby('cluster'):
        print(df2)

    df.to_csv(out_path)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--experiment',
        type=str,
    )
    parser.add_argument(
        '--answers',
        type=str,
    )
    parser.add_argument(
        '--raw',
        type=str,
        help='Alternative to --experiment and --answers',
    )
    parser.add_argument(
        '--out',
        type=str,
    )
    args = parser.parse_args()
    if args.raw is not None:
        main_simple(
            raw_path=args.raw,
            out_path=args.out,
        )
    else:
        main(
            answers_path=args.answers,
            experiment_path=args.experiment,
            out_path=args.out,
        )
