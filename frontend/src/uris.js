export default {
  checkEmail: () => "http://localhost:8000/check-email",
  disciplinas: () => "http://localhost:8000",
  disciplina: (slug) => `http://localhost:8000/${slug}`,
  alunos: (slug) => `http://localhost:8000/${slug}/aluno`,
  alunosUpload: (slug) => `http://localhost:8000/${slug}/aluno/upload`,
  templates: (slug) => `http://localhost:8000/${slug}/template`,
  template: (slugDisciplina, slugTemplate) =>
    `http://localhost:8000/${slugDisciplina}/template/${slugTemplate}`,
  templateMarkdown: (slugDisciplina, slugTemplate) =>
    `http://localhost:8000/${slugDisciplina}/template/${slugTemplate}/markdown`,
  renderMarkdown: (slugDisciplina, slugTemplate, destinatario) => {
    const query = destinatario ? `?destinatario=${destinatario}` : "";
    return `http://localhost:8000/${slugDisciplina}/template/${slugTemplate}/render${query}`;
  },
  enviados: (slugDisciplina, slugTemplate) =>
    `http://localhost:8000/${slugDisciplina}/template/${slugTemplate}/enviado`,
  enviar: (slugDisciplina, slugTemplate) =>
    `http://localhost:8000/${slugDisciplina}/template/${slugTemplate}/enviar`,
};
