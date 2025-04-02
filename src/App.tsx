import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Authenticator } from "@aws-amplify/ui-react"
import '@aws-amplify/ui-react/styles.css'

import React from 'react';
import { uploadData, getUrl } from 'aws-amplify/storage';
import { StorageManager, StorageImage } from '@aws-amplify/ui-react-storage';

const client = generateClient<Schema>();

function App() {
    const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
    const [file, setFile] = useState<File | null>(null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const fetchTodos = async () => {
        const { data: items } = await client.models.Todo.list();
        alert(items.length + "개의 데이터를 가져왔습니다.");
    };

    useEffect(() => {
        const subscription = client.models.Todo.observeQuery().subscribe({
            next: (data) => setTodos([...data.items]),
        });

        return () => subscription.unsubscribe();
    }, []);

    function createTodo() {
        const content = window.prompt("Todo content");
        if (content) {
            client.models.Todo.create({ content });
        }
    }

    function deleteTodo(id: string) {
        client.models.Todo.delete({ id });
    }

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file first');
            return;
        }

        try {
            const result = await uploadData({
                key: `picture-submissions/${file.name}`,
                data: file,
            }).result;
            console.log('Upload successful:', result);
            alert('File uploaded successfully!');
            setFile(null);
            // Reset file input
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading file. Please try again.');
        }
    };

    const linkToStorageFile = async () => {
        try {
            const linkUrl = await getUrl({
                key: "picture-submissions/aws_logo_smile_1200x630.png",
            });
            console.log('signed URL: ', linkUrl.url);
            console.log('URL expires at: ', linkUrl.expiresAt);
        } catch (error) {
            console.error('Error generating URL:', error);
            alert('Error generating download URL. Please try again.');
        }
    };

    return (
        <Authenticator>
            {({signOut, user}) => (
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
                        <button onClick={handleUpload} disabled={!file}>
                            Upload
                        </button>
                        <StorageManager
                            acceptedFileTypes={['image/*']}
                            accessLevel="guest"
                            maxFileCount={1}
                            isResumable
                        />
                        <StorageImage 
                            alt="data" 
                            imgKey="picture-submissions/aws_logo_smile_1200x630.png"
                            accessLevel="guest"
                        />
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
