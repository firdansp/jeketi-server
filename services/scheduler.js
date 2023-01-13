const Datastore = require('../classes/datastore')


const datastore = new Datastore('test')

datastore.insert('testing', 'tolol', {tan:'zhi', hui: 'selin'})
.then(ok => {
  console.log(ok[0].indexUpdates)
})