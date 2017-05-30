"""Utility to add vector and cluster information to items based on worker
answers"""
import argparse
import collections
import cPickle as pickle
import json
import os

import Algorithmia
import nltk
import numpy as np
import pandas as pd
import sklearn

CACHED_FILENAME = os.path.join(os.path.dirname(__file__),
                               'cached_vectors.pickle')


def cluster_questions(df, k=8, cache=True, overwrite=False):
    """Cluster questions."""
    doc_vectors = []
    questionids = []
    questionids_other = []
    cached = cache and os.path.exists(CACHED_FILENAME) and not overwrite
    if cached:
        with open(CACHED_FILENAME, 'rb') as f:
            cached_vectors = pickle.load(f)
    else:
        cached_vectors = dict()
    for questionid, df2 in df.groupby('questionid'):
        print df2
        question_reason = ' '.join(df2[df2.reason != False]['reason'])
        if cached:
            doc_vector = cached_vectors[questionid]
        else:
            doc_vector = get_doc_vector(question_reason)
            cached_vectors[questionid] = doc_vector
        if doc_vector is not None:
            doc_vectors.append(doc_vector)
            questionids.append(questionid)
        else:
            questionids_other.append(questionid)
    if not cached:
        with open(CACHED_FILENAME, 'wb') as f:
            pickle.dump(cached_vectors, f)

    kmeans = sklearn.cluster.KMeans(n_clusters=min(k, len(questionids)))
    Y = kmeans.fit_predict(np.array(doc_vectors))
    clusters = collections.defaultdict(list)
    for questionid, y in zip(questionids, Y):
        clusters[y].append(questionid)

    question_embeddings = dict()
    for questionid, vector in zip(questionids, doc_vectors):
        question_embeddings[questionid] = vector

    return clusters.values(), questionids_other, question_embeddings


def get_word_vectors(text):
    """Get word vectors."""
    words = nltk.tokenize.casual_tokenize(text)
    client = Algorithmia.client(os.environ['ALGORITHMIA_KEY'])
    algo = client.algo('jbragg/word2vec/0.1.1')
    resp = algo.pipe(dict(getVecFromWord=words)).result
    vectors = [v['vector'] for v in resp['vecFromWord'] if
               v['vector'] is not None]

    return vectors


def get_doc_vector(text):
    """Get document vector."""
    vectors = get_word_vectors(text)
    if len(vectors) > 0:
        arr = np.array(vectors)
        return np.mean(arr, axis=0)
    else:
        return None


def main(answers_path, experiment_path, out_path, n_clusters):
    """Create new experiment file with item cluster information.

    Args:
        answers_path (str): Path to answers data file.
        experiment_path (str): Path to experiment file.
        out_path (str): Path to augmented experiment file.
        n_clusters (str): Number of clusters to use.

    """
    df = pd.read_json(answers_path, orient='records')

    def filter1(row):
        """Select answers less than 100% confident for clustering."""
        return bool(row['likert_from_mean'] < 2 or row['reason'])
    df_filtered = df[df.apply(filter1, axis=1)]
    clusters, questionids_other, embeddings = cluster_questions(
        df_filtered, k=n_clusters)
    question_to_cluster = dict()
    for i, cluster in enumerate(clusters):
        for questionid in cluster:
            question_to_cluster[questionid] = i

    with open(experiment_path, 'r') as f:
        experiment = json.load(f)
    for item in experiment['data']['data']:
        questionid = item['id']
        item['cluster'] = question_to_cluster[
            questionid] if questionid in question_to_cluster else -1
        if questionid in embeddings:
            item['vector'] = embeddings[questionid].tolist()

    with open(out_path, 'w') as f:
        json.dump(experiment, f)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--experiment',
        type=str,
        default='../src/static/private/pilot_instructions_experiment.json')
    parser.add_argument(
        '--answers',
        type=str,
        default='../src/static/private/pilot_instructions_data_anon.json')
    parser.add_argument(
        '--out',
        type=str,
        default='../src/static/private/pilot_instructions_experiment.with_vec.json')
    parser.add_argument(
        '--n_clusters',
        type=int,
        default=5)  # TODO(jbragg): Choose number of clusters?
    args = parser.parse_args()
    main(n_clusters=args.n_clusters,
         answers_path=args.answers,
         experiment_path=args.experiment,
         out_path=args.out)
