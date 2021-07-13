import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import prettyBytes from 'pretty-bytes';

const form = document.querySelector('[data-form]');
const queryParamsContainer = document.querySelector('[data-query-params]');
const requestHeaderContainer = document.querySelector('[data-request-headers]');
const keyValueTemplate = document.querySelector('[data-key-value-template]');
const responseHeadersContainer = document.querySelector('[data-response-headers]');
// const queryParamsContainer = document.querySelector('[data-query-params]');
// const queryParamsContainer = document.querySelector('[data-query-params]');

axios.interceptors.request.use((request) => {
  request.customData = request.customData || {};
  request.customData.startTime = new Date().getTime();
  return request;
});

axios.interceptors.response.use(updateEndTime, (e) => {
  return Promise.reject(updateEndTime(e.response));
});

function updateEndTime(response) {
  response.customData = response.customData || {};
  response.customData.time = new Date().getTime() - response.config.customData.startTime;
  return response;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  axios({
    url: document.querySelector('[data-url]').value,
    method: document.querySelector('[data-method]').value,
    params: keyValueParisToObject(queryParamsContainer),
    headers: keyValueParisToObject(requestHeaderContainer)
  })
    .catch((e) => e)
    .then((res) => {
      document.querySelector('[data-response-section]').classList.remove('d-none');
      updateResponseDetail(res);
      updateResponseEditor(res.data);
      updateResponseHeaders(res.headers);
      console.log(res);
    });
});

document.querySelector('[data-add-query-param-btn]').addEventListener('click', () => {
  queryParamsContainer.append(createKeyValuePair());
});

document.querySelector('[data-add-request-header-btn]').addEventListener('click', () => {
  requestHeaderContainer.append(createKeyValuePair());
});

function createKeyValuePair() {
  const element = keyValueTemplate.content.cloneNode(true);

  element.querySelector('[data-remove-btn]').addEventListener('click', (e) => {
    e.target.closest('[data-key-value-pair]').remove();
  });

  return element;
}

function keyValueParisToObject(container) {
  const pairs = container.querySelectorAll('[data-key-value-pair]');
  const results = [...pairs].reduce((data, pair) => {
    const key = pair.querySelector('[data-key]').value;
    const value = pair.querySelector('[data-value]').value;
    if (key === '') return data;
    return { ...data, [key]: value };
  }, {});
  console.log(results);
  return results;
}

function updateResponseDetail(res) {
  document.querySelector('[data-status]').innerHTML = res.status;
  document.querySelector('[data-time]').innerHTML = res.customData.time;
  document.querySelector('[data-size]').innerHTML = prettyBytes(
    JSON.stringify(res.data).length + JSON.stringify(res.headers).length
  );
}

function updateResponseEditor(data) {}

function updateResponseHeaders(headers) {
  console.log(headers);
  responseHeadersContainer.innerHTML = '';
  Object.entries(headers).forEach(([key, value]) => {
    const keyElement = document.createElement('div');
    keyElement.textContent = key;
    responseHeadersContainer.append(keyElement);

    const valueElement = document.createElement('div');
    valueElement.textContent = value;
    responseHeadersContainer.append(valueElement);
  });
}
