import React from "react";
import { useRouter } from "next/router";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import uris from "../../src/uris";
import Checkbox from "@material-ui/core/Checkbox";

export default function Aluno({ disciplinaSlug, alunos }) {
  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
  };

  const handleFileChanged = (event) => {
    const formData = new FormData();
    formData.append("file", event.target.files[0]);
    fetch(uris.alunosUpload(disciplinaSlug), {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then(refreshData)
      .catch(console.error);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Matriculado</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Sobrenome</TableCell>
              <TableCell>Nome de usuário</TableCell>
              <TableCell>E-mail</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alunos.map((aluno) => (
              <TableRow key={`aluno___${aluno.nome}`}>
                <TableCell component="th" scope="row">
                  <Checkbox checked={aluno.matriculado} />
                </TableCell>
                <TableCell>{aluno.nome}</TableCell>
                <TableCell>{aluno.sobrenome}</TableCell>
                <TableCell>{aluno.username}</TableCell>
                <TableCell>{aluno.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button variant="contained" color="primary" component="label" fullWidth>
        Carregar arquivo (Blackboard)
        <input type="file" hidden onChange={handleFileChanged} />
      </Button>
    </>
  );
}

export async function getServerSideProps(context) {
  const { disciplina: slug } = context.query;

  const disciplina = await fetch(uris.disciplina(slug))
    .then((res) => res.json())
    .catch(console.error);

  const alunos = await fetch(uris.alunos(slug))
    .then((res) => res.json())
    .catch(console.error);

  return {
    props: {
      disciplinaSlug: slug,
      disciplina,
      alunos,
      breadcrumbs: [
        ["Home", "/"],
        [disciplina.nome, `/${disciplina.slug}`],
        ["Alunos", `/${disciplina.slug}/aluno`],
      ],
    }, // will be passed to the page component as props
  };
}
