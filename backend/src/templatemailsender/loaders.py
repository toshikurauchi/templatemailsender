from typing import Dict, Union, List
import pandas as pd
from pathlib import Path
import json

from templatemailsender.settings import MATRICULADO


def carrega_alunos_blackboard(filename: Union[str, Path]) -> pd.DataFrame:
    filename = Path(filename)
    if filename.suffix =='.csv':
        encoding = 'utf-8'
        sep=','
    elif filename.suffix == '.xls':
        encoding = 'utf-16'
        sep='\t'
    else:
        raise RuntimeError(f"Can't load students from {filename}. Unknown extension.")
    with open(filename, encoding=encoding) as f:
        df = pd.read_csv(f, sep=sep)

        data = {'nome': [], 'sobrenome': [], 'username': [], 'email': []}
        for user_data in df.iterrows():
            primeiro_nome = user_data[1]['Nome']
            try:
                sobrenome = user_data[1]['Sobrenome']
            except:
                primeiro_nome = primeiro_nome.split(' ')[0]
                sobrenome = ' '.join(primeiro_nome.split(' ')[1:])
            username = user_data[1]['Nome do usuário']
            email = username + '@al.insper.edu.br'
            data['nome'].append(primeiro_nome.title())
            data['sobrenome'].append(sobrenome.title())
            data['username'].append(username)
            data['email'].append(email)
        return pd.DataFrame(data)


def _read_json_data(filename):
    with open(filename) as f:
        data = json.load(f)
    if not data:
        return None
    if isinstance(data, list):
        if isinstance(data[0], list):
            data_dict = {k: list(v) for k, *v in zip(*data)}
            return pd.DataFrame(data_dict)
    raise RuntimeError(f"Can't load data from {filename}. Unknown json format.")


def _fix_name(s):
    for t in [int, float]:
        try:
            t(s)
            return f'_{s}'
        except:
            pass
    return s


def fix_column_names(df):
    column_names = {c: _fix_name(c) for c in df.columns}
    return df.rename(columns=column_names)


def load_data_file(filename: Union[str, Path]) -> pd.DataFrame:
    filename = Path(filename)
    if filename.suffix =='.xlsx':
        return fix_column_names(pd.read_excel(filename).dropna(how='all'))
    elif filename.suffix == '.json':
        return fix_column_names(_read_json_data(filename))
    else:
        raise RuntimeError(f"Can't load data from {filename}. Unknown extension.")


def filter_by_username(data: pd.DataFrame, usernames: List[str]):
    return data[data['username'].isin(usernames)]


def filter_enrolled(data: pd.DataFrame):
    return data[data[MATRICULADO]]


def get_names(data: pd.DataFrame, usernames: List[str]) -> Dict[str, str]:
    filtered = filter_by_username(data, usernames)
    return {r['username']: r['nome'] for _, r in filtered.iterrows()}
