import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Authenticator } from "@aws-amplify/ui-react"
import '@aws-amplify/ui-react/styles.css'

import React from 'react';
import { uploadData,getUrl } from 'aws-amplify/storage';
import { StorageManager, StorageImage } from '@aws-amplify/ui-react-storage';



const client = generateClient<Schema>();

function App() {
    const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
    const [file, setFile] = React.useState();

    const handleChange = (event: any) => {
        setFile(event.target.files[0]);
    };

    const fetchTodos = async () => {
        const { data: items, errors } = await client.models.Todo.list();
        alert(items.length +"개의 데이터를 가져왔습니다.")
    };

    useEffect(() => {
        client.models.Todo.observeQuery().subscribe({
            next: (data) => setTodos([...data.items]),
        });
    }, []);

    function createTodo() {
        client.models.Todo.create({ content: window.prompt("Todo content") });
    }

    function deleteTodo(id: string) {
        client.models.Todo.delete({ id })
    }

    const linkToStorageFile = async () =>{
        const linkUrl = await getUrl({
            path: "picture-submissions/aws_logo_smile_1200x630.png",
        });

        console.log('signed URL: ', linkUrl.url);
        console.log('URL expires at: ', linkUrl.expiresAt);
    };

    return (
        <Authenticator>
            {({signOut, user})=> (
                <main>
                    <h1> {user?.signInDetails?.loginId}'s todos</h1>
                    <button onClick={createTodo}>+ new</button>
                    <ul>
                        {todos.map((todo) => (
                            <li
                                onClick={() => deleteTodo(todo.id)}
                                key={todo.id}>{todo.content}</li>
                        ))}
                    </ul>
                    <div>
                        🥳 App successfully hosted. Try creating a new todo.
                        <br />
                        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
                            Review next step of this tutorial.
                        </a>
                    </div>
                    <div>
                        <input type="file" onChange={handleChange}/>
                        <button
                            onClick={() =>
                                uploadData({
                                    path: `picture-submissions/${file.name}`,
                                    data: file,
                                })
                            }
                        >
                            Upload
                        </button>
                        <StorageManager
                            acceptedFileTypes={['image/*']}
                            path="picture-submissions/"
                            maxFileCount={1}
                            isResumable
                        />
                        <StorageImage alt="data" path="picture-submissions/aws_logo_smile_1200x630.png"/>

                    </div>
                    <div>
                        <button onClick={linkToStorageFile}>Download URL 생성하기</button>
                    </div>
                    <div>
                        <button onClick={fetchTodos}>Fetch Data</button>
                        <button onClick={signOut}>Sign out</button>
                    </div>
                </main>
            )}
        </Authenticator>
    );
}

export default App;