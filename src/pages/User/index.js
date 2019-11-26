import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: false,
    page: 1,
    refreshing: false,
    endOfList: false,
  };

  async componentDidMount() {
    this.apiDataLoad();
  }

  apiDataLoad = async (page = 1) => {
    this.setState({ loading: true });
    const { stars } = this.state;
    const { navigation } = this.props;
    const user = navigation.getParam('user');
    const response = await api.get(`/users/${user.login}/starred`, {
      params: { page },
    });
    this.setState({
      page,
      stars:
        page >= 2 && response.data
          ? [...stars, ...response.data]
          : response.data,
      loading: false,
      refreshing: false,
      endOfList: response.data.length < 30,
    });
  };

  loadMore = async () => {
    const { page, endOfList } = this.state;
    if (endOfList) {
      return;
    }
    this.apiDataLoad(page + 1);
  };

  refreshList = () => {
    const { stars } = this.state;
    if (stars && stars.length > 0) {
      this.setState({ refreshing: false, loading: false });
      return;
    }

    this.setState({ refreshing: true, stars: [], page: 1 }, this.apiDataLoad());
  };

  handleNavigate = repository => {
    const { navigation } = this.props;
    navigation.navigate('Repository', { repository });
  };

  render() {
    const { navigation } = this.props;
    const user = navigation.getParam('user');
    const { stars, loading, refreshing, endOfList } = this.state;
    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        {loading && stars.length < 1 ? (
          <ActivityIndicator color="#7159c1" />
        ) : (
          <Stars
            data={stars}
            onRefresh={this.refreshList}
            refreshing={refreshing}
            keyExtractor={star => String(star.id)}
            onEndReachedThreshold={endOfList ? 0 : 0.2}
            onEndReached={this.loadMore}
            renderItem={({ item }) => (
              <Starred onPress={() => this.handleNavigate(item)}>
                <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}
      </Container>
    );
  }
}
