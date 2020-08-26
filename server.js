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
    primaryKey: true,
    autoIncrement: true
  },
  assetUrl:{
    type: DataTypes.STRING
  },
  organizationId: {
    type: DataTypes.STRING
  },
  assetType: {
    type: DataTypes.ENUM(["watermark", "background"]),
  }
},{
  paranoid: true,
  timestamps: true,
  updatedAt: false
});


const AssetAssociation = sequelize.define('AssetAssociation', {
  assetId: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  videoSessionId: {
    type: DataTypes.STRING,
    primaryKey: true
  }
}, {
  paranoid: true,
  timestamps: true,
  updatedAt: false
});

AssetAssociation.belongsTo(Asset, {foreignKey : 'assetId'});
Asset.hasMany(AssetAssociation, {foreignKey : 'assetId'});

sequelize.sync({force: true});

// Create an asset in the system
app.post('/assets', async (req, res) => {
  const createdAsset = await Asset.create(req.body)
  res.json(createdAsset);
});


// Create associate an asset with a video session
app.post('/assets/:assetId/associate', async (req, res) => {
  let {videoSessionId} = req.body;
  let assetId = req.params.assetId;

  // TODO: Add validations, like already existent association, etc
  // First assert there is no more than 1 association existing already
  // Query to get the count of assets belonging to a videoSession by assetType
  // SELECT video_assets.assetType, count(*) FROM video_assets_associations 
  // LEFT JOIN video_assets 
  // ON video_assets.id = video_assets_associations.assetId
  // WHERE video_assets_associations.session_id = $sessionId
  // GROUP BY video_assets.assetType;

  // Then create the assocation if no validation errors where found
  
  let association = await AssetAssociation.create({
    videoSessionId,
    assetId
  });
  res.json(association);
});

// Get list of all assets for an specific organization
// Maybe paginate ?
app.get('/organizations/:organizationId/assets', async (req, res) => {
  let organizationId = req.params.organizationId;
  let organizations = await Asset.findAll({
    where: {organizationId}
  });
  res.json(organizations);
});

// Get all assets associated with a session (not paginated for now)
app.get('/sessions/:videoSessionId/assets', async (req, res) => {
  // SELECT * FROM video_assets 
  // LEFT JOIN video_assets_associations
  // ON video_assets.id = video_assets_associations.session_id
  // WHERE  video_assets_associations.session_id = req.id"
  let videoSessionId = req.params.videoSessionId;
  let associations = await AssetAssociation.findAll({
    where: {videoSessionId},
    include: Asset
  });
  let assets = associations.map((assoc) => assoc.Asset);
  res.json(assets);
});


app.get('/', (req, res) => {
  res.json({ hello: 'world' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});