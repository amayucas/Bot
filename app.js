var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
// Create chat bot
var connector = new builder.ChatConnector({
    appId: '',
    appPassword: ''
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//Labels que vamos a usar
var DialogLabels = {
    Si: 'S',
    No: 'N',
    Test: 'Test de Preguntas',
    Salir: 'Salir'
}; 

//=========================================================
// Bots Dialogs
//=========================================================
bot.dialog('/', [
    function (session) {
        builder.Prompts.text(session, 'Hola...¿Cuál es tu nombre?');
    },
    function (session, results) {
        session.userData.name = results.response;
        builder.Prompts.choice(session, 'Hola ' +session.userData.name+ ', Selecciona una opción: ',[DialogLabels.Test, DialogLabels.Salir],
            {
                maxRetries: 3,
                retryPrompt: 'No es una opcion valida'
            });
    },
    function (session, results) {
        if (!results.response) {
            // exhausted attemps and no selection, start over
            session.send('¡Lo siento! Intentos posibles superados');
            return session.endDialog();
        }
        var test=results.response.entity;
        switch(test){
            case DialogLabels.Test:
                return session.beginDialog('/questions');
            case DialogLabels.Salir:
                return session.endDialog();
        }
    },
    //Aquí ponemos preguntas si dice que si
    function (session, results) {
        var op=results.response.entity;
        switch (op) {
            case DialogLabels.Si:
                session.send("¿Cuantos años tienes?");
            case DialogLabels.No:
                return session.endDialog();
        }
    },
    //Final
    function (session, results) {
        session.userData.age=results.response;
        builder.Prompts.text(session,'Vale ' +session.userData.name+'entonces tienes '+session.userData.age+' años.');
        session.endDialog();
    }
]);
bot.dialog('/questions',function (session) {
        builder.Prompts.choice(session,"¿Puedo hacerte algunas preguntas?(S/N)",
            [DialogLabels.Si,DialogLabels.No]);
    
});