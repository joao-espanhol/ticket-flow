console.log('Index.js');
const app = require('./config/server');
const routes = require('./app/routes/routes');

routes.verificar_chamados_todos(app);
routes.verificar_chamados_filtrados(app); 
routes.render_criar_chamados(app);
routes.criar_chamados(app);

