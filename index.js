console.log('Index.js');
const app = require('./config/server');
const routes = require('./app/routes/routes');

routes.verificar_chamados_todos(app);
routes.verificar_chamados_filtrados(app); 
routes.render_criar_chamados(app);
routes.criar_chamado(app);
routes.excluir_chamado(app);
routes.render_conectar(app);
routes.autenticar_usuario(app);
routes.desconectar_usuario(app);
routes.render_criar_usuarios(app);
routes.cadastrar_usuarios(app);
routes.listar_usuarios(app);
routes.render_not_found(app);

