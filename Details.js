import React from 'react';
import {
    View,
    StyleSheet,
    Text,
    Image,
    TouchableOpacity,
    Alert,
    Dimensions,
    BackHandler
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useState } from 'react';

const DetailsScreen = ({ navigation, route }) => {
    const [isFavourite, setIsFavourite] = useState(route.params.isFavourite)
    const item = (route.params.item);

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                route.params.onNavigateBack(item.id, isFavourite);
                console.log('back');
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () =>
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        })
    );

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text>{item.username}</Text>
            <Image
                source={{ uri: item.images.original.url }}
                style={styles.fullImage}
            />
            <TouchableOpacity
                hitSlop={{ top: 5, bottom: 5, right: 5, left: 5 }}
                onPress={() => {
                    if (route.params.favouritesLength >= 5 && !route.params.isFavourite) {
                        Alert.alert('Favourites list overflow', 'No. of favourites items in the list exceeded.');
                    }
                    else {
                        setIsFavourite(!isFavourite)
                    }
                }}
            >
                <Image
                    source={isFavourite ?
                        require('./678087-heart-512.webp') :
                        require('./heart-131965017458786724.png')}
                    style={styles.favouriteIcon}
                />
            </TouchableOpacity>
            <Text style={styles.title}>{item.title}</Text>
        </View>
    )
}

export default DetailsScreen;

const styles = StyleSheet.create({
    fullImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height * 2 / 3
    },
    favouriteIcon: {
        height: 40,
        width: 40,
        resizeMode: 'contain'
    },
    title: {
        marginTop: 10,
        fontSize: 15
    }
})