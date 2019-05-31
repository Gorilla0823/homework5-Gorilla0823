const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

const key = require('./privateSettings.json');

// TODO(you): Change the value of this string to the spreadsheet id for your
// GSA spreadsheet. See HW5 spec for more information.
const SPREADSHEET_ID = '1leVRKnPfOIAD_hmM7jbS8stm6Y2qUrFaMxcHnjbdyAo';

const app = express();
const jsonParser = bodyParser.json();
const sheet = googleSheets(key.client_email, key.private_key, SPREADSHEET_ID);

app.use(express.static('public'));

async function onGet(req, res) {
  const result = await sheet.getRows();
  const rows = result.rows;
  console.log(rows);
  var out = [] ,count=0;
  if(rows.length<2)
    res.json( { error : 'The List is empty.'} );
  else{
    for(let i=1;i<rows.length;i++){
      let inner = {} ;
      for(let j=0;j<rows[i].length;j++)    
        inner[rows[0][j]]=rows[i][j];
      out[count++]=inner;
    }
    res.json(out);
  }
}
app.get('/api', onGet);

async function onPost(req, res) {
  const messageBody = req.body;
  const result = await sheet.getRows();
  const rows = result.rows;
  var email,name;
  console.log(email+'  '+name);
  for(let title in messageBody){
    if(title.toLowerCase()==="email") email=messageBody[title];
    else if(title.toLowerCase()==="name") name=messageBody[title];
  }
  await sheet.appendRow([name,email]); 
  res.json({ response:'success'});
}
app.post('/api', jsonParser, onPost);

async function onPatch(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  const messageBody = req.body;
  const result = await sheet.getRows();
  const rows = result.rows;
  var fillin,column2;
  for(let title in messageBody){
      fillin=messageBody[title];
      column2=title;
  }
  for(let i=1;i<rows.length;i++){
      if(rows[0][0]===column.toLowerCase()){
          if(rows[i][0].toLowerCase()===value.toLowerCase()
              && column2.toLowerCase()===rows[0][1].toLowerCase()){
              await sheet.setRow(i,[rows[i][0],fillin]);
              break;
          }
          else if(rows[i][0].toLowerCase()===value.toLowerCase()
              &&column2.toLowerCase()===rows[0][0].toLowerCase()){
              await sheet.setRow(i,[fillin,rows[i][1]]);
              break;
          }
      }
      else{
          if(rows[i][1]===value
            &&column2.toLowerCase()===rows[0][0]){
              await sheet.setRow(i,[fillin,rows[i][1]]);
              break;
          }
          else if(rows[i][1]===value
            &&column2.toLowerCase()===rows[0][1]){
              await sheet.setRow(i,[rows[i][0],fillin]);
              break;
          }
      }
  }  
  res.json({ response:'success'});
}
app.patch('/api/:column/:value', jsonParser, onPatch);

async function onDelete(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  const result = await sheet.getRows();
  const rows = result.rows;
  var index=-1;
  for(let i=0;i<rows[0].length;i++){
      if(rows[0][i].toLowerCase()===column.toLowerCase()){
          index=i;
          break;
      }
  }
  for(let i=1;i<rows.length;i++){
      if(index!==-1){
          if(index===0){
              if(rows[i][index].toLowerCase()===value.toLowerCase()){
                  await sheet.deleteRow(i);
                  break;
              }
          }
          else{
              if(rows[i][index]===value){
                  await sheet.deleteRow(i);
                  break;
              }
          }
      }
  } 
  res.json({ response:'success'});
}
app.delete('/api/:column/:value',  onDelete);

// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`CS193X: Server listening on port ${port}!`);
});
