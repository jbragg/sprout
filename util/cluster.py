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


def _concatenate_df_reasons(df):
    """Return text from unclear reasons."""
    words = df.unclear_type.fillna('').str.cat(sep=' ') or ''
    more_words = df.unclear_reason.fillna('').str.cat(sep=' ') or ''
    if more_words:
        words += ' {}'.format(more_words)
    return words.strip()


def cluster_questions(df, cache=True, cached_filename=None):
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
    vectorizor = TfidfVectorizer(
        input='content',
        stop_words='english',
    )
    doc_word_matrix = vectorizor.fit_transform(questions)
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

    questionids = questions.index
    questionids_other = set(df.questionid.unique()).difference(questionids)
    clusters = collections.defaultdict(list)
    k = 5
    model = cluster.KMeans(n_clusters=min(k, doc_feature_matrix.shape[0]))
    model = cluster.AffinityPropagation()
    Y = model.fit_predict(doc_feature_matrix)
    for questionid, y in zip(questionids, Y):
        clusters[y].append(questionid)
    print(clusters)
    exemplars = [questionids[x] for x in model.cluster_centers_indices_]

    question_embeddings = dict()
    for questionid, vector in zip(questionids, doc_feature_matrix.tolist()):
        question_embeddings[questionid] = vector

    return (
        [clusters[x] for x in sorted(clusters)],
        exemplars,
        questionids_other,
        question_embeddings,
    )


def main(answers_path, experiment_path, out_path, cached_filename=None):
    """Create new experiment file with item cluster information.

    Args:
        answers_path (str): Path to answers data file.
        experiment_path (str): Path to experiment file.
        out_path (str): Path to augmented experiment file.
        cached_filename (Optional[str])

    """
    if cached_filename is None:
        cached_filename = os.path.basename(answers_path) + '.pickle.CACHED'
    df = pd.read_json(answers_path, orient='records')

    def filter1(row):
        """Select answers with reasons for clustering."""
        return bool(row['unclear_reason'] or row['unclear_type'])
    df_filtered = df[df.apply(filter1, axis=1)]
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


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--experiment',
        type=str)
    parser.add_argument(
        '--answers',
        type=str)
    parser.add_argument(
        '--out',
        type=str)
    args = parser.parse_args()
    main(answers_path=args.answers,
         experiment_path=args.experiment,
         out_path=args.out)
