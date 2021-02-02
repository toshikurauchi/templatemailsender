from pathlib import Path
import pandas as pd

from templatemailsender.loaders import filter_enrolled, carrega_alunos_blackboard, load_data_file, filter_by_username, get_names
from templatemailsender.settings import MATRICULADO


DATA_DIR = Path(__file__).parent / 'data'
STUDENTS_COMMA = DATA_DIR / 'students_comma.csv'
STUDENTS_TAB = DATA_DIR / 'students_tab.xls'
JSON_DATA = DATA_DIR / 'test_data.json'
EXCEL_DATA = DATA_DIR / 'excel_data.xlsx'
STUDENT_DATA = {
    'Aluno': {'nome': 'Aluno', 'sobrenome': 'Sobrenome', 'username': 'login1', 'email': 'login1@al.insper.edu.br'},
    'Baluno': {'nome': 'Baluno', 'sobrenome': 'Tobrenome', 'username': 'login2','email': 'login2@al.insper.edu.br'},
    'Caluno': {'nome': 'Caluno', 'sobrenome': 'Uobrenome', 'username': 'login3','email': 'login3@al.insper.edu.br'},
}


def create_student_df():
    return pd.DataFrame(STUDENT_DATA.values())


def assert_student_data(students):
    assert len(students) == 3
    for _, row in students.iterrows():
        assert row['nome'] in STUDENT_DATA
        data = STUDENT_DATA[row['nome']]
        for k, v in data.items():
            assert row[k] == v


def test_load_blackboard_student_data_with_tabs():
    students = carrega_alunos_blackboard(STUDENTS_TAB)
    assert_student_data(students)


def test_load_blackboard_student_data_with_tabs_str_filename():
    students = carrega_alunos_blackboard(str(STUDENTS_TAB))
    assert_student_data(students)


def test_load_blackboard_student_data_with_comma():
    students = carrega_alunos_blackboard(STUDENTS_COMMA)
    assert_student_data(students)


def test_load_blackboard_student_data_with_comma_str_filename():
    students = carrega_alunos_blackboard(str(STUDENTS_COMMA))
    assert_student_data(students)


def test_load_json_data():
    data = load_data_file(JSON_DATA)
    assert isinstance(data, pd.DataFrame)
    assert data.shape[0] == 2
    assert data.shape[1] == 7
    assert data.iat[0, 0] == 'login1'
    assert data.iat[1, 0] == 'login3'


def test_load_json_data_str_filename():
    data = load_data_file(str(JSON_DATA))
    assert isinstance(data, pd.DataFrame)
    assert data.shape[0] == 2
    assert data.shape[1] == 7
    assert data.iat[0, 0] == 'login1'
    assert data.iat[1, 0] == 'login3'


def test_load_excel_data():
    data = load_data_file(EXCEL_DATA)
    assert isinstance(data, pd.DataFrame)
    assert data.shape[0] == 4
    assert data.shape[1] == 5
    assert pd.isna(data.iat[0, 0])
    assert data.iat[1, 0] == 'login1'
    assert data.iat[2, 0] == 'login2'
    assert data.iat[3, 0] == 'login3'


def test_load_excel_data_str_filename():
    data = load_data_file(str(EXCEL_DATA))
    assert isinstance(data, pd.DataFrame)
    assert data.shape[0] == 4
    assert data.shape[1] == 5
    assert pd.isna(data.iat[0, 0])
    assert data.iat[1, 0] == 'login1'
    assert data.iat[2, 0] == 'login2'
    assert data.iat[3, 0] == 'login3'


def test_filter_by_username():
    student_data = create_student_df()
    filtered = filter_by_username(student_data, ['login2', 'login3'])
    assert isinstance(filtered, pd.DataFrame)
    assert filtered.shape[0] == 2
    assert filtered.shape[1] == 4
    assert filtered.iat[0, 2] == 'login2'
    assert filtered.iat[1, 2] == 'login3'


def test_filter_enrolled():
    student_data = create_student_df()
    student_data.loc[:, MATRICULADO] = [True, False, True]
    filtered = filter_enrolled(student_data)
    assert isinstance(filtered, pd.DataFrame)
    assert filtered.shape[0] == 2
    assert filtered.shape[1] == 5
    assert filtered.iat[0, 2] == 'login1'
    assert filtered.iat[1, 2] == 'login3'


def test_get_names():
    student_data = create_student_df()
    expected = {'login3': 'Baluno', 'login3': 'Caluno'}
    names = get_names(student_data, list(expected.keys()))
    assert names == expected
