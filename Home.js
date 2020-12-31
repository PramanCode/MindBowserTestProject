import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    TextInput,
    Alert,
    Dimensions
} from 'react-native';

const WindowSize = Math.floor(Dimensions.get('screen').height / 100) + 1;
const GiphyURL = 'https://api.giphy.com/v1/gifs/trending?api_key=AC6U6kYngGKEL6QZpiDZsrwpkcfqs3aF';
const FavouritesExceedMessage = 'No. of favourites items in the list exceeded.';
const DataFetchingError = 'An error occured while fetching the data';

export default class HomeScreen extends React.Component {

    constructor(props) {
        super(props);
        this.renderItem = this.renderItem.bind(this);
        this.markFavourite = this.markFavourite.bind(this);
    }

    state = {
        allData: [],
        visibleData: [],
        limit: '10',
        isLoading: false,
        favourites: [],
        searchText: ''
    }

    componentDidMount() {
        this.fetchData()
    }

    fetchData = async () => {
        this.setState({ isLoading: true });
        let giphyURL = GiphyURL + '&limit=' + this.state.limit + '&rating=g';
        await fetch(giphyURL, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(snapshot => {
                if (snapshot.meta.status == 200) {
                    let resultData = [];
                    snapshot.data.forEach(item => {
                        if ('title' in item) {
                            resultData.push(item);
                        }
                    })
                    this.setState({ allData: resultData, isLoading: false, visibleData: resultData });
                }
                else {
                    Alert.alert('An error occured', DataFetchingError);
                    this.setState({ allData: [], isLoading: false, visibleData: [] });
                }
            })
            .catch(error => {
                Alert.alert('An error occured', DataFetchingError);
                this.setState({ allData: [], isLoading: false, visibleData: [] });
            })
    }

    markFavourite = (itemId, isFavourite) => {
        if (!isFavourite) {
            const newFavourites = this.state.favourites;
            newFavourites.splice(this.state.favourites.indexOf(itemId), 1)
            this.setState({ favourites: newFavourites });
        }
        else {
            if (this.state.favourites.length >= 5) {
                Alert.alert('Favourites list overflow', FavouritesExceedMessage);
            }
            else {
                const newFavourites = this.state.favourites;
                newFavourites.push(itemId);
                this.setState({ favourites: newFavourites });
            }
        }
    }

    searchData = () => {
        let resultArray = [];
        this.state.allData.forEach(item => {
            if (item.username.toLowerCase().search(this.state.searchText) >= 0) {
                resultArray.push(item);
            }
        });
        this.setState({ visibleData: resultArray });
    }


    renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => this.props.navigation.navigate('Details',
                    {
                        'item': item,
                        'isFavourite': this.state.favourites.includes(item.id),
                        'favouritesLength': this.state.favourites.length,
                        onNavigateBack: this.markFavourite.bind(this)
                    })}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                        source={{ uri: item.images.original.url }}
                        style={styles.imageSize}
                    />
                    <Text style={{ marginLeft: 30 }}>{item.username}</Text>
                </View>
                <TouchableOpacity
                    hitSlop={{ top: 5, bottom: 5, right: 5, left: 5 }}
                    onPress={() => this.markFavourite(item.id, !this.state.favourites.includes(item.id))}
                >
                    <Image
                        source={this.state.favourites.includes(item.id) ? require('./678087-heart-512.webp') : require('./heart-131965017458786724.png')}
                        style={styles.favouriteIcon}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                {
                    (this.state.isLoading) ?

                        <ActivityIndicator size={'large'} />
                        :
                        <View style={{ flex: 1 }}>
                            <View style={styles.searchHeaderContainer}>
                                <TextInput
                                    ref={(ref) => this.searchInputRef = ref}
                                    onChangeText={(text) => {
                                        this.setState({ searchText: text }, this.searchData);
                                    }}
                                    value={this.state.searchText}
                                    placeholder={'Search'}
                                    style={styles.searchInput}
                                    onSubmitEditing={this.searchData}
                                />
                                <TouchableOpacity
                                    style={styles.searchButton}
                                    onPress={() => {
                                        this.searchInputRef.blur();
                                        this.searchData()
                                    }}
                                >
                                    <Text style={{ color: 'white' }}>
                                        {'Search'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <FlatList
                                keyExtractor={(item, index) => String(item.id)}
                                data={this.state.visibleData}
                                renderItem={this.renderItem}
                                initialNumToRender={WindowSize * 2}
                                windowSize={WindowSize}
                                maxToRenderPerBatch={WindowSize * 3}
                                bounces={false}
                                getItemLayout={(visibleData, index) => (
                                    { length: 125, offset: 125 * index, index }
                                )}
                            />
                            <View style={styles.footerContainer}>
                                <TextInput
                                    ref={(ref) => this.limitInput = ref}
                                    onChangeText={(text) => this.setState({ limit: text })}
                                    value={this.state.limit}
                                    placeholder={'Enter Limit'}
                                    style={styles.limitInput}
                                    keyboardType={'numeric'}
                                    onSubmitEditing={this.fetchData}
                                />
                                <TouchableOpacity
                                    style={styles.limitButton}
                                    onPress={() => {
                                        this.limitInput.blur();
                                        this.fetchData()
                                    }}
                                >
                                    <Text style={{ color: 'white' }}>
                                        {'Set List Limit'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                }



            </View>
        )
    }
}

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'row',
        alignSelf: 'stretch',
        padding: 20,
        backgroundColor: 'lavender',
        marginVertical: 10,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    imageSize: {
        height: 50,
        width: 50
    },
    favouriteIcon: {
        height: 40,
        width: 40,
        resizeMode: 'contain'
    },
    searchHeaderContainer: {
        alignSelf: 'stretch',
        padding: 5,
        flexDirection: 'row',
        backgroundColor: '#add8e6'
    },
    searchInput: {
        backgroundColor: 'white',
        margin: 10,
        fontSize: 16,
        paddingHorizontal: 5,
        padding: 0,
        alignSelf: 'stretch',
        flex: 1
    },
    searchButton: {
        backgroundColor: '#20b2aa',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0
    },
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffe4c4'
    },
    limitInput: {
        backgroundColor: 'white',
        margin: 10,
        fontSize: 16,
        paddingHorizontal: 5,
        padding: 0
    },
    limitButton: {
        backgroundColor: '#d2691e',
        padding: 5,
        borderWidth: 1
    }
})