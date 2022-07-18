import React, { useState } from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
// Navigation
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackScreenParamList } from "../navigation/HomeStack";
// Forms
import { SignForm } from '../components/SignForm';
// Firebase
import auth from '@react-native-firebase/auth';
// autologin
import { MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage";

type HomeScreenNavigationProp = NativeStackScreenProps<HomeStackScreenParamList, 'Identification'>

const MMKV = new MMKVLoader().initialize();

// -------- IDENTIFICATION -------------
const SignInScreen = ({ route, navigation }: HomeScreenNavigationProp) => {

    // Identifiants stockés dans le localStorage
    const [userEmail, setUserEmail] = useMMKVStorage<string | undefined>("userEmail", MMKV);
    const [userPassword, setUserPassword] = useMMKVStorage<string | undefined>("userPassword", MMKV);

    console.log("------------------------------------------------------------------- SignInScreen");
    console.log("SignInScreen: route.params.parentCallback = " + route.params.parentCallback);

    const [data, setData] = useState(); // données saisie dans le formulaire
    const [error, setError] = useState<string>('');

    const callbackData = (childData: any) => {
        console.log('SignInScreen: ------callBackForm parent-------');
        setData(childData);
        console.log(childData);

        auth()
            .signInWithEmailAndPassword(childData.email, childData.password)
            .then(() => {
                console.log('SignInScreen: Utilisateur logué !');

                // Stockage des identifiants dans le localStorage
                setUserEmail(childData.email);
                setUserPassword(childData.password);

                // On renseigne la page parente que le user est connecté => TRUE
                route.params.parentCallback(true);
            })
            .catch(error => {
                switch (error.code) {
                    case 'auth/user-not-found':
                        setError("Il n'y a pas d'utilisateur correspondant à cet identifiant.");
                        break;
                    case 'auth/wrong-password': 
                        setError("Le mot de passe n'est pas valide ou l'utilisateur ne possède pas de mot de passe.");
                        break;
                    case 'auth/too-many-requests':
                        setError("Nous avons bloqué toutes les demandes provenant de cet appareil en raison d'une activité inhabituelle. Essayez à nouveau plus tard. [L'accès à ce compte a été temporairement désactivé en raison de nombreuses tentatives de connexion infructueuses. Vous pouvez le rétablir immédiatement en réinitialisant votre mot de passe ou vous pouvez réessayer plus tard. ]]");
                        break;
                    default:
                        setError(error.message);
                }
                console.log(error);
            });
    }

    return (
        <View style={styles.container}>

            <SignForm formType='sign-in' callBackTheData={callbackData} error={error} />

            <View style={styles.containerFooterText}>
                <Text style={styles.text}>Pas encore inscrit ?</Text>
                <Pressable onPress={() => navigation.navigate('Inscription')}>
                    <Text style={styles.textLink}>Créer un compte</Text>
                </Pressable>
            </View>
        </View>
    )
}

export default SignInScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        padding: 20,
        backgroundColor: '#efefef',
        justifyContent: 'space-around',
    },
    containerFields: {
        justifyContent: 'space-between',
    },
    containerField: {
        alignItems: 'flex-start',
    },
    containerFooterText: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    field: {
        maxWidth: 500,
        marginVertical: 20,
        borderColor: 'lightblue',
    },
    containerButtons: {
        paddingVertical: 50,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    text: {
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    textLink: {
        marginLeft: 10,
        color: 'blue',
    },
    textError: {
        color: 'red',
    }
});