const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    const user = users.filter((user) => {
        return user.username === request.body.username || user.username === request.headers.username;
    });
    if (user) {
        request.user = user;
        next();
    } else {
        response.status(404).json({ error: 'Usuário não cadastrado!' });
    }

}

app.post('/users', (request, response) => {
    const { name, username } = request.body;

    const user = users.filter((user) => {
        return user.username === request.body.username;
    });
    if (user.length > 0) {
        response.status(400).json({ error: 'Usuário já cadastrado!' });
    } else {
        const userNew = {
            id: uuidv4(),
            name,
            username,
            todos: []
        };

        users.push(userNew);

        response.status(201).json(userNew);
    }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { username } = request.headers;

    const user = users.find((user) => {
        return user.username === username;
    });

    response.status(200).json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const { username } = request.headers;
    const indiceUser = users.findIndex(user => user.username === username);

    const todo = {
        id: uuidv4(),
        title,
        deadline: new Date(deadline),
        done: false,
        created_at: new Date()
    };

    users[indiceUser].todos.push(todo);

    response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;
    const { username } = request.headers;
    const { id } = request.params;
    const indiceUser = users.findIndex(user => user.username === username);
    const indiceTodo = users[indiceUser].todos.findIndex(todo => todo.id === id);

    if (indiceTodo < 0) {
        response.status(404).json({ error: 'Todo não encotrado!' });
    }

    const todo = {...users[indiceUser].todos[indiceTodo], deadline: new Date(deadline), title };


    users[indiceUser].todos[indiceTodo] = todo;

    response.status(202).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
    const { username } = request.headers;
    const { id } = request.params;
    const indiceUser = users.findIndex(user => user.username === username);
    const indiceTodo = users[indiceUser].todos.findIndex(todo => todo.id === id);

    if (indiceTodo < 0) {
        response.status(404).json({ error: 'Todo não encotrado!' });
    }

    const todo = {...users[indiceUser].todos[indiceTodo], done: !users[indiceUser].todos[indiceTodo].done };

    users[indiceUser].todos[indiceTodo] = todo;

    response.status(202).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { username } = request.headers;
    const { id } = request.params;
    const indiceUser = users.findIndex(user => user.username === username);
    const indiceTodo = users[indiceUser].todos.findIndex(todo => todo.id === id);

    if (indiceTodo < 0) {
        response.status(404).json({ error: 'Todo não encotrado!' });
    }

    users[indiceUser].todos = users[indiceUser].todos.filter(todo => todo.id !== id);

    response.status(204).json({});
});

module.exports = app;