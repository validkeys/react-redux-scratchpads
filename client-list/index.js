import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers, bindActionCreators, applyMiddleware, compose } from 'redux';
import { Provider, connect } from 'react-redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';
import { createSelector } from 'reselect';
import _ from 'lodash';

const DevTools = createDevTools(
  <DockMonitor toggleVisibilityKey='ctrl-h'
               changePositionKey='ctrl-q'>
    <LogMonitor theme='tomorrow' />
  </DockMonitor>
);

// SELECTORS
const allClientsSelector        = (state) => state.clients;
const clientFilterQuerySelector = (state) => state["components/client-list"].query

const filteredClientsSelector   = createSelector(
  allClientsSelector,
  clientFilterQuerySelector,
  ( clients, query ) => {
    if (!query){ return clients; }
    return _.filter(clients, ((item) => {
      return item.name.toLowerCase().indexOf(query.toLowerCase()) > -1;
    }));
  }
);


// TYPES
const CHANGE_FILTER_QUERY = "CHANGE_FILTER_QUERY";

// ACTIONS
const actions = {
  clientListFilterQueryChange(val) {
    return {
      type:     CHANGE_FILTER_QUERY,
      payload:  val
    }
  }
};


const clientListReducer = (state = {
  query: null
}, {type, payload}) => {
  switch(type) {
    case CHANGE_FILTER_QUERY:
      return Object.assign({}, state, { query: payload });
      break;
    default:
      return state;
  }
  return state;
}

const clientsReducer = (state = [
  { id: 1, name: "Alaska" },
  { id: 2, name: "Montana" },
  { id: 3, name: "Kentucky" },
  { id: 4, name: "Ohio" }
], action) => {
  return state;
}

// STORE
const reducers = combineReducers({
  "components/client-list": clientListReducer,
  clients: clientsReducer
});

const loggerMiddleware = createLogger();
const enhancer = compose(
  // loggerMiddleware should always be last
  applyMiddleware(thunk, loggerMiddleware),
  DevTools.instrument()
);

const configureStore = (initialState) => {
  // Note: only Redux >= 3.1.0 supports passing enhancer as third argument.
  // See https://github.com/rackt/redux/releases/tag/v3.1.0
  const store = createStore(reducers, {} , enhancer);

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (module.hot) {
    module.hot.accept('../reducers', () =>
      store.replaceReducer(require('../reducers')/*.default if you use Babel 6+ */)
    );
  }

  return store;
}
const store = configureStore({});

const mapStateToProps     = (state) => ({ state });
const mapDispatchToProps  = (dispatch) => ({ actions: bindActionCreators(actions, dispatch) });


const ClientList = (props) => {
  let componentState = props.state['components/client-list'];

  const handleChange = (e) => {
    props.actions.clientListFilterQueryChange( e.target.value );
  };

  return (
    <div>
      <input type="text" onChange={handleChange} value={componentState.query} />

      <div>
        {props.clients.map((item) => {
          return <div key={item.id}>{item.name}</div>
        })}
      </div>

    </div>
  );
};
const XClientList = connect((state) => {
  return {
    state:    state,
    clients:  filteredClientsSelector(state)
  };
}, mapDispatchToProps)(ClientList);

ReactDOM.render((
  <Provider store={store}>
    <div>
      Scratchpad
      <XClientList />
      <DevTools />
    </div>
  </Provider>
), document.getElementById("myapp"));
