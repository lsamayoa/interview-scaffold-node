const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const Sequelize = require('sequelize')
const DataTypes = Sequelize.DataTypes;
const sequelize = new Sequelize('hopin', 'root', '*******', {
  host: 'localhost',
  dialect: 'mysql',
});

// Define the model for the database
const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.INTEGER, // for now integer but we could use uuid
    primaryKey: true
  },
  assetUrl:{
    type: DataTypes.STRING
  },
  organizationId: {
    type: DataTypes.STRING
  },
  assetType: {
    type: DataTypes.ENUM(["waterbark", "background"]),
  }
},{
  paranoid: true,
  timestamps: true
});


// const AssetAssociation = sequelize.define({
//   assetId: {
//     type: DataTypes.INTEGER // integer for now because parent has integer but could be uuid
//   },
//   sessionId: {
//     type: DataTypes.STRING // maybe uuid
//   }
// }, {
//   paranoid: true,
//   timestamps: true
// });

// Asset.hasMany(AssetAssociation);

// Create an asset in the system
app.post('/assets', (req, res) => {
  // First assert there is no more than 1 association existing already
  // SELECT * FROM video_assets
  // WHERE organization_id = req.headers.organizationId;
  const createdAsset = Asset.create(req.body);
  res.json(createdAsset);
});


// Create an associate an asset with a session 
app.post('/assets/{id}/associate', (req, res) => {
  // SELECT count(*) FROM video_assets_associations 
  // WHERE session_id = req.id;

  res.json();
});

// Get list of all assets for an specific organization
app.get('/organizations/:id/assets', (req, res) => {
  // "SELECT * FROM video_assets WHERE organization_id = req.id"
  let organizationId = req.params.id;

  Asset.findAll({
    where: {organizationId}
  })
  .then((result) => res.json(result))
  .catch((error) => res.json({error: error}));
});

// Get all assets associated with a session (not paginated for now)
app.get('/sessions/{id}/assets', (req, res) => {
  // SELECT * FROM video_assets 
  // LEFT JOIN video_assets_associations
  // ON video_assets.id = video_assets_associations.session_id
  // WHERE  video_assets_associations.session_id = req.id"
});


app.get('/', (req, res) => {
  res.json({ hello: 'world' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});