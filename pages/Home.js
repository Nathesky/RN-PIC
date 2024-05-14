import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Image, FlatList, Text, StyleSheet } from 'react-native';
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage, fire } from "../Firebase";
import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import * as ImagePicker from "expo-image-picker";

export default function Home() {
    const [image, setImage] = useState("");
    const [files, setFiles] = useState([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(fire, "files"), (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    setFiles((prevFiles) => [...prevFiles, change.doc.data()]);
                }
            });
        });

        return () => unsubscribe();
    }, []);

    async function uploadImage(uri, fileType) {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, new Date().toISOString());
        const uploadTask = uploadBytesResumable(storageRef, blob);

        uploadTask.on(
            "state_changed",
            null,
            (error) => {
                console.error(error);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                await saveRecord(fileType, downloadURL, new Date().toISOString());
                setImage("");
            }
        );
    }

    async function saveRecord(fileType, url, createdAt) {
        try {
            await addDoc(collection(fire, "files"), {
                fileType,
                url,
                createdAt,
            });
        } catch (e) {
            console.log(e);
        }
    }

    async function pickImage() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const { uri } = result.assets[0];
            setImage(uri);
            await uploadImage(uri, "image");
        }
    }

    return (
        <View style={estilo.container}>
            <Text style={estilo.titulo}>Arquivos Enviados</Text>
            <FlatList
                data={files}
                keyExtractor={(item) => item.url}
                renderItem={({ item }) => {
                    if (item.fileType === "image") {
                        return (
                            <Image
                                source={{ uri: item.url }}
                                style={estilo.fotos}
                            />
                        );
                    }
                    return null;
                }}
                numColumns={2}
            />
            <TouchableOpacity
                onPress={pickImage}
                style={estilo.button}
            >
                <Text style={estilo.buttonText}>Selecionar Imagens</Text>
            </TouchableOpacity>
        </View>
    );
}

const estilo = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    fotos: {
        width: 150,
        height: 150,
        borderRadius: 10,
        margin: 5,
    },
    titulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'gray',
        marginBottom: 10,
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: 'lightblue',
        marginTop: 10,
    },
    buttonText: {
        fontSize: 16,
        color: 'white',
    },
});
