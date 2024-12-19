const { hash } = require("bcrypt");
const dbConnection = require("../../config/dbConnection");
const { getUser, getUsers, insertNewUser, getPostoGrad, updateUser, deactivateUser } = require('../models/usuarios.js');
const { bcryptCompareHash, bcryptGenerateHash } = require('../utils/bcrypt.js');

module.exports.render_conectar = (app, req, res) => {
    console.log('[Controller usuarios] abrindo tela login');
    res.render('conectar.ejs', {error: null});
}

module.exports.autenticar = async (app, req, res) => {
    console.log('[Controller usuarios] autenticando usuario');
    try {
        dbConn = dbConnection();
        const { email, password } = req.body;
        const user = await getUser(dbConn, email, (error, result) =>{
            if (error) {
                console.error('Erro na consulta:', error);
                return res.status(500).render('notfound.ejs', {
                    errorMessage: 'Erro ao buscar chamados: ' + error.sqlMessage
                });
            }   
            result;
        });

        if(user.length < 1) {
            console.log('[Controller usuarios] autenticação falhou');
            return res.status(500).render('conectar.ejs', { error: true });
        } 
        
        const hash = user[0].senha;
        const autenticacao = await bcryptCompareHash(password, hash);
        console.log(user, autenticacao);
        
        if(!autenticacao) {
            console.log('[Controller usuarios] autenticação falhou');
            return res.status(500).render('conectar.ejs', { error: true });    
        }

        console.log('[Controller usuarios] usuário autenticado');
        req.session.user = {
            id: user[0].id_usuario,
            complete_name: user[0].nome_completo, 
            war_name: user[0].nome_guerra,
            telefone: user[0].telefone,
            email: user[0].email,
            user_type: user[0].tipo,
            grad_post: user[0].descricao 
        };
        
        console.log('[Controller usuarios] Req session', req.session);
        res.redirect('/');
    }
    catch (error) {
        console.log('[Controller usuarios] problema ao autenticar ' + error);
        return res.status(500).render('notfound.ejs', {
            errorMessage: 'Erro na busca no banco: ' + error.sqlMessage
        });
    }
    finally {
      if(dbConn) dbConnection.closeConnection(dbConn);
    }
}

module.exports.desconectar = (app, req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.redirect('/');
        }
        res.redirect('/usuarios/conectar');
    });
}

module.exports.render_criar_usuarios = async (app, req, res) => {
    console.log('[Controller usuarios] abrindo criar_usuario');
    let dbConn;

    try {
        dbConn = dbConnection();
        const postoGrads = await getPostoGrad(dbConn);
        if(postoGrads) {
            res.render('criar_usuario.ejs', { dados: null, posto_grads: postoGrads, error: null });
        }

    } catch (error) {
        console.error('[Controller usuarios] erro abrindo criar_usuario:', error);
        return res.status(500).render('notfound.ejs', {
            errorMessage: 'Erro ao buscar dados: ' + (error.sqlMessage || error.message)
        });
    } finally {
        if (dbConn) {
            try {
                dbConnection.closeConnection(dbConn);
            } catch (closeError) {
                console.error('[Controller usuarios] erro ao fechar conexão:', closeError);
            }
        }
    }
};

module.exports.render_erro_criar_usuarios = async (app, req, res, error) => {
    console.log('[Controller usuarios] abrindo erro_criar_usuario');
    let dbConn;

    try {
        dbConn = dbConnection();
        const postoGrads = await getPostoGrad(dbConn);
        console.log(req.body);
        console.log(req.body.nome_completo);
        if(postoGrads) {
            res.render('criar_usuario.ejs', { dados: req.body, posto_grads: postoGrads, error: error });
        }

    } catch (error) {
        console.error('[Controller usuarios] erro abrindo criar_usuario:', error);
        return res.status(500).render('notfound.ejs', {
            errorMessage: 'Erro ao buscar dados: ' + (error.sqlMessage || error.message)
        });
    } finally {
        if (dbConn) {
            try {
                dbConnection.closeConnection(dbConn);
            } catch (closeError) {
                console.error('[Controller usuarios] erro ao fechar conexão:', closeError);
            }
        }
    }
};


module.exports.cadastrarUsuario = async (app, req, res) => {
    console.log('[Controller usuarios] cadastrar usuario');
    const { nome_completo, nome_guerra, telefone, email, senha, tipo, id_posto_grad } = req.body;

    try {
        const hash = await bcryptGenerateHash(senha);

        dbConn = dbConnection();
        const postoGrads = await getPostoGrad(dbConn);
        await insertNewUser(dbConn, nome_completo, nome_guerra, telefone, email, hash, tipo, id_posto_grad, async (error, result) =>{
            if (error) {
                console.error('Erro na consulta:', error);
                return res.render('criar_usuario.ejs', { dados: req.body, posto_grads: postoGrads, error: error});
            }
            res.redirect('/usuarios');
        });
    } catch (error) {
        console.log('[Controller usuarios] erro cadastrar usuario', error);
        return res.status(500).render('notfound.ejs', {
            errorMessage: 'Erro ao buscar dados: ' + error.sqlMessage
        });
    } finally {
        if(dbConn) dbConnection.closeConnection(dbConn);
    }

}

module.exports.listar_usuarios = async (app, req, res) => {
    console.log('[Controller usuarios] listar usuarios');

    try {
        dbConn = dbConnection();
        await getUsers(dbConn, (error, result) =>{
            if (error) {
                console.error('Erro na consulta:', error);
                res.redirect('/');
            }
            res.render('listar_usuarios.ejs', { usuarios: result });
        });
    } catch (error) {
        console.log('[Controller usuarios] erro cadastrar usuario', error);
        return res.status(500).render('notfound.ejs', {
            errorMessage: 'Erro ao buscar dados: ' + error.sqlMessage
        });
    } finally {
        if(dbConn) dbConnection.closeConnection(dbConn);
    }

}

module.exports.render_alterar_usuario = async (app, req, res) => {
    console.log('[Controller usuarios] render alterar usuario');
    const email = req.query.email;

    try {
        dbConn = dbConnection();
        const user = await getUser(dbConn, email);
        const posto_grad = await getPostoGrad(dbConn);
        res.render('alterar_usuarios.ejs', { dados: user, posto_grads: posto_grad, error: null });
    } catch (error) {
        console.log('[Controller usuarios] erro cadastrar usuario', error);
        return res.status(500).render('notfound.ejs', {
            errorMessage: 'Erro ao buscar dados: ' + error.sqlMessage
        });
    } finally {
        if(dbConn) dbConnection.closeConnection(dbConn);
    }
}

module.exports.alterar_usuario = async (app, req, res) => {
    console.log('[Controller usuarios] alterar usuario');
    const id = req.query.id;
    const { nome_completo, nome_guerra, telefone, email, tipo, id_posto_grad } = req.body; 
    console.log(req.query, req.body, id);
    
    try {
        dbConn = dbConnection();
        await updateUser(dbConn, id, nome_completo, nome_guerra, telefone, email, tipo, id_posto_grad, (error, result) =>{
            if (error) {
                console.error('Erro na consulta:', error);
                res.redirect('/');
            }
        });
        res.redirect('/usuarios');
    } catch (error) {
        console.log('[Controller usuarios] erro cadastrar usuario', error);
        return res.status(500).render('notfound.ejs', {
            errorMessage: 'Erro ao buscar dados: ' + error.sqlMessage
        });
    } finally {
        if(dbConn) dbConnection.closeConnection(dbConn);
    }
}

module.exports.desativar_usuarios = async (app, req, res) => {
    console.log('[Controller usuarios] desativar_usuario');
    const id = req.query.id;
    

    try {
        dbConn = dbConnection();
        await deactivateUser(dbConn, id);
        res.redirect('/usuarios');        
    } catch (error) {
        console.log('[Controller usuarios] erro cadastrar usuario', error);
        return res.status(500).render('notfound.ejs', {
            errorMessage: 'Erro ao buscar dados: ' + error.sqlMessage
        });
    } finally {
        if(dbConn) dbConnection.closeConnection(dbConn);
    }
}

