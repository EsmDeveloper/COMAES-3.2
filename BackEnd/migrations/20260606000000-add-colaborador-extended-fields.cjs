'use strict';

/** Adiciona campos estendidos ao perfil de colaborador:
 * - username (único, público)
 * - nivel_academico (nível académico/profissional)
 * - documentos_colaborador (JSON - array de paths dos ficheiros enviados)
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('usuarios');

    if (!tableDesc.username) {
      await queryInterface.addColumn('usuarios', 'username', {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
        comment: 'Username público do utilizador (letras, números, _, -)',
        after: 'nome',
      });
    }

    if (!tableDesc.nivel_academico) {
      await queryInterface.addColumn('usuarios', 'nivel_academico', {
        type: Sequelize.ENUM(
          'estudante_universitario',
          'tecnico',
          'licenciado',
          'mestre',
          'doutor',
          'professor',
          'profissional',
          'outro'
        ),
        allowNull: true,
        comment: 'Nível académico/profissional (colaboradores)',
        after: 'disciplina_colaborador',
      });
    }

    if (!tableDesc.documentos_colaborador) {
      await queryInterface.addColumn('usuarios', 'documentos_colaborador', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
        comment: 'Documentos enviados pelo colaborador (array de objetos { nome, caminho, tipo, tamanho, data_upload })',
        after: 'nivel_academico',
      });
    }
  },

  async down(queryInterface) {
    const tableDesc = await queryInterface.describeTable('usuarios');
    if (tableDesc.documentos_colaborador)
      await queryInterface.removeColumn('usuarios', 'documentos_colaborador');
    if (tableDesc.nivel_academico)
      await queryInterface.removeColumn('usuarios', 'nivel_academico');
    if (tableDesc.username)
      await queryInterface.removeColumn('usuarios', 'username');
  },
};
