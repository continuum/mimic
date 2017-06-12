import React from 'react';
import styled from 'styled-components';
import includes from 'lodash/includes';
import API from 'api';
import EVENTS from 'api/constants/events';
import RequestLogState from 'ui/states/RequestLogState';
import { connectToState } from 'ui/states/connector';
import { filterLogByType } from 'ui/utils/filters';
import { RequestOptionSpacer } from 'ui/components/QuickEdit/styled';
import Frame from 'ui/components/common/Frame';
import HeaderCell from 'ui/components/RequestLogs/HeaderCell';
import RequestRow from 'ui/components/RequestLogs/RequestRow';
import SearchInput from 'ui/components/BottomBar/SearchInput';
import { Div } from 'ui/components/common/base';

const ScrollableContainer = styled(Div)`
  height: 100%;
  overflow-y: auto;
  background: linear-gradient(
    to bottom,
    white,
    white 50%,
    #f0f0f0 50%,
    #f0f0f0
  );
  background-size: 100% 50px;
`;

const HeaderRow = styled(Div)`
  background-color: white;
  border-bottom: ${(props) => props.theme.darkBorder};
  width: 100%;
  display: flex;
`;

class RequestLog extends React.Component {

  state = {
    selectedRequestId: null
  };

  componentDidMount() {
    API.on(EVENTS.REQUEST_CAPTURED, RequestLogState.triggerUpdates);
    API.on(EVENTS.RESPONSE_RECEIVED, RequestLogState.triggerUpdates);
  }

  componentWillUnmount() {
    API.off(EVENTS.REQUEST_CAPTURED, RequestLogState.triggerUpdates);
    API.off(EVENTS.RESPONSE_RECEIVED, RequestLogState.triggerUpdates);
  }

  selectRequest = (request) => () => this.setState({ selectedRequestId: request.id });
  onQueryChange = (event) => RequestLogState.updateQuery(event.target.value);
  clearQuery = () => RequestLogState.updateQuery('');

  renderCapturedRequests = (renderRequestRow) => {
    return API.capturedRequests
      .filter((request) => includes(request.url, RequestLogState.query))
      .filter(filterLogByType)
      .map(renderRequestRow)
      .reverse();
  };

  controls = () => (
    <Div style={{ display: 'flex' }}>
      <SearchInput query={ RequestLogState.query }
                   onBlur={ this.hideFilters }
                   onFocus={ this.showFilters }
                   onChange={ this.onQueryChange }
                   onClearQuery={ this.clearQuery }
                   onFilterChange={ RequestLogState.updateFilter }
                   filterValue={ RequestLogState.filter }
                   filterOptions={ ['All', 'Mocked', 'Unmocked', 'Successful', 'Failing'] }/>
    </Div>

  );

  getCellWidth = (cellName) => {
    return RequestLogState.columns[cellName]
  };

  render() {
    return (
      <Frame controls={ this.controls() }>
        <HeaderRow>
          <HeaderCell width={ this.getCellWidth('time') } cell="time">
            <RequestOptionSpacer/>
            Time
          </HeaderCell>
          <HeaderCell width={ this.getCellWidth('url') } cell="url">URL</HeaderCell>
          <HeaderCell width={ this.getCellWidth('params') } cell="params">Request Params</HeaderCell>
          <HeaderCell width={ this.getCellWidth('status') } cell="status">Status</HeaderCell>
          <HeaderCell width={ this.getCellWidth('delay') } cell="delay">Delay</HeaderCell>
          <HeaderCell autosize>Response Body</HeaderCell>
        </HeaderRow>

        <ScrollableContainer>
          {
            this.renderCapturedRequests((request) => (
              <RequestRow key={ request.id }
                          request={ request }
                          getCellWidth={ this.getCellWidth }
                          query={ RequestLogState.query }
                          onSelect={ this.selectRequest }
                          selected={ this.state.selectedRequestId === request.id }/>
            ))
          }
        </ScrollableContainer>
      </Frame>
    );
  }
}

export default connectToState(RequestLogState, RequestLog);
