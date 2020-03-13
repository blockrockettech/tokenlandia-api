const dotenv = require('dotenv');
const _ = require('lodash');
const axios = require('axios');

if (process.env.NODE_ENV === 'test') {
  console.log(`Applying dotenv config for [${process.env.NODE_ENV}]`);
  const result = dotenv.config({path: `./.env.${process.env.NODE_ENV}`});
  if (result.error) throw result.error;
} else {
  console.log(`Applying default dotenv`);
  const result = dotenv.config({path: './.env'});
  if (result.error) throw result.error;
}

const CHAIN_ID = 4;
const API_HOST = `https://api-56b6el2v7a-uc.a.run.app`;

async function addCreateJobToQueue(tokenId) {
  const payload = {
    'token_id': tokenId.toString(),
    'coo': 'USA',
    'artist_initials': 'RSA',
    'series': '002',
    'design': '0003',
    'name': `token ${tokenId}`,
    'description': `token ${tokenId} description`,
    'image': 'https://picsum.photos/5000/2000',
    'artist': 'artist',
    'artist_assistant': 'assistant',
    'brand': 'brand',
    'model': 'model',
    'purchase_location': 'london',
    'purchase_date': '2020-02-01',
    'customization_location': 'tokyo',
    'customization_date': '2020-02-06',
    'material_1': 'a',
    'material_2': 'b',
    'material_3': 'c',
    'material_4': 'd',
    'material_5': 'e',
  };

  console.log(`Firing create job for token ID [${tokenId}]...`);
  await axios
    .post(`${API_HOST}/v1/network/${CHAIN_ID}/job/submit/createtoken/general?key=${process.env.API_ACCESS_KEY}`, payload)
    .catch(e => {
      if (e.response) {
        console.log(`Could not create token [${payload.token_id}]. Failed with ${e.response.status} - ${e.response.data.error}`);
      }
    });
}

async function addUpdateJobToQueue(tokenId) {
  const payload = {
    'token_id': tokenId.toString(),
    'purchase_location': 'manchester',
    'purchase_date': '2020-03-11',
    'customization_location': 'japan',
    'customization_date': '2020-03-11',
    'material_1': 'a1',
    'material_2': 'b2',
    'material_3': 'c3',
    'material_4': 'd3',
    'material_5': 'e3'
  };

  console.log(`Firing update job for token ID [${tokenId}]...`);
  await axios
    .post(`${API_HOST}/v1/network/${CHAIN_ID}/job/submit/updatetoken/general?key=${process.env.API_ACCESS_KEY}`, payload)
    .catch(e => {
      if (e.response) {
        console.log(`Could not update token [${payload.token_id}]. Failed with ${e.response.status} - ${e.response.data.error}`);
      }
    });
}

async function addTransferJobToQueue(tokenId) {
  const payload = {
    'token_id': tokenId.toString(),
    'recipient': '0x35f96368fb58c8816f9751bda3207572cc1b7473'
  };

  console.log(`Firing transfer job for token ID [${tokenId}]...`);
  await axios
    .post(`${API_HOST}/v1/network/${CHAIN_ID}/job/submit/transfer?key=${process.env.API_ACCESS_KEY}`, payload)
    .catch(e => {
      if (e.response) {
        console.log(`Could not transfer token [${payload.token_id}]. Failed with ${e.response.status} - ${e.response.data.error}`);
      }
    });
}


(async function runScript() {
  console.log('Load Test API Script started!\n');
  addCreateJobToQueue(2100);

  // Fire create requests
  for (let i = 2150; i < 2200; i++) {
    addCreateJobToQueue(i);
  }


  // Fire update requests
  for (let i = 2000; i < 2050; i++) {
    addUpdateJobToQueue(i);
  }

  // Fire transfer requests
  for (let i = 2000; i < 2050; i++) {
    addTransferJobToQueue(i);
  }
})();
