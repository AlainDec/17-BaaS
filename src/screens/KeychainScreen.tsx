import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Pressable, TouchableOpacity, FlatList } from 'react-native';
//import { Button } from 'react-native-paper';
// Navigation
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackScreenParamList } from "../navigation/HomeStack";
// Firebase
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
// Icônes
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// Interfaces
import { IData } from '../Interfaces';
// Components
import DataList from '../components/DataList';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackScreenParamList>



const KeychainScreen = ({ route, navigation }: NativeStackNavigationProp<HomeStackScreenParamList, 'Identification'>) => {

    //const navigation = useNavigation<HomeScreenNavigationProp>();
    const [data, setData] = useState<IData[]>([]);
    const [countData, setCountData] = useState<number>(0);
    let userAuth = auth().currentUser;

    function onResult(querySnapshot: any) {
        console.log('KeychainScreen: Récupération de la collection des users');

        // Récupération des datas en DB
        let items: IData[] = [];
        querySnapshot.forEach((snapshot: any) => {
            console.log("KeychainScreen: ID=" + snapshot.id);
            let id = { 'id:': snapshot.id }
            let item = snapshot.data();
            item.id = snapshot.id;
            items.push(item as IData);
        });

        console.log("KeychainScreen: onResult()");
        console.log(items);
        setCountData(items.length);
        setData(items);
    }

    function onError(error: any) {
        console.error(error);
    }

    useEffect(() => {
        console.log("KeychainScreen: utilisateur = " + userAuth?.uid);
        // Listener sur les modifications de la requête. Il surveille la collection "Trousseau"
        // lorsque les documents sont modifiés (suppression, ajout, modification)
        // Donc si j'ajoute un champ dans Firebase, en web, l'app mobile affichera en temps réel
        // la nouvelle ligne, sans refresh manuel !
        console.log("KeychainScreen: useEffect()");
        if (userAuth) {
            // Le RETURN permet d'arrêter le listener onSnapShot de Firestore.
            // Si on ne fait pas de return, il continuera à écouter, même si l'utilisateur n'est plus loggué, et donc : erreurs !
            return firestore()
                .collection('Users')
                .doc(userAuth.uid)
                .collection('Trousseau')
                .onSnapshot(onResult, onError);
        }

    }, [])

    const logout = () => {
        auth()
            .signOut()
            .then(() => {
                // On renseigne la page parente que le user est déconnecté => FALSE
                route.params.parentCallback(false);
            });
    }

    const addItem = (): void => {
        navigation.navigate("AddKeychain");
    }

    const updateItem = (itemId: string): void => {
        navigation.navigate("UpdateKeychain", {
            itemId: itemId
        });
    }

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <Text style={styles.count}>{countData} compte{countData > 1 && 's'}</Text>
                <Pressable onPress={addItem} style={[{ alignSelf: 'flex-end' }]}>
                    <View style={styles.buttonSmall}>
                        <Icon name="plus" size={28} color="white" />
                    </View>
                </Pressable>
            </View>

            {
                // data.map( (item: IData) => <DataList {...item} /> )
                data.map( (item: IData) => <DataList data={item} upload={(titi:string)=>updateItem(titi)}/> )
            }
  
            <View style={{ alignItems: 'center', marginTop: 20 }}>
                <Pressable onPress={logout} style={styles.pressable}>
                    <View style={styles.button}>
                        <Text style={styles.text}>Se déconnecter</Text>
                    </View>
                </Pressable>
            </View>
        </View>
    )
}

export default KeychainScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        padding: 20,
        backgroundColor: '#efefef',
        //justifyContent: 'space-around',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    pressable: {
        width: '60%',
    },
    button: {
        marginVertical: 10,
        padding: 15,
        backgroundColor: 'tomato',
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 30,
    },
    buttonSmall: {
        marginVertical: 2,
        paddingVertical: 6,
        paddingHorizontal: 6,
        backgroundColor: 'tomato',
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 30,
    },
    text: {
        textAlign: 'center',
        textTransform: 'uppercase',
        color: 'white',
        fontWeight: 'bold',
    },
    textSmall: {
        textAlign: 'center',
        textTransform: 'uppercase',
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    title: {
        fontSize: 14,
    },
    textItem: {
        color: 'black',
        fontSize: 14,
        paddingRight: 0,
        paddingVertical: 8,
    },
    textLine1: {
        flex: 1,
        backgroundColor: '#eaeaea',
    },
    textLine2: {
        flex: 1.5,
        backgroundColor: '#f5f5f5',
    },
    textLine3: {
        flex: 1.5,
        backgroundColor: '#fffcfc',
    },
    count: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 22,
    },
    row: {
        flexDirection: 'row',
    }
});