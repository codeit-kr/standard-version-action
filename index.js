const core = require('@actions/core');
const standardVersion = require('standard-version');
const mongoose = require('mongoose');
const { getConfiguration } = require('standard-version/lib/configuration');


async function run() {
  try {
    mongoose.set('strictQuery', true);
    mongoose.connect("mongodb+srv://standard-version-sync:XzAiK9zJkPc8KCY2@standard-version-sync.glsnip8.mongodb.net/standard-version-sync")
    const Schema = mongoose.Schema;
    const Sync = new Schema({
      count: Number,
    });
    const SyncModel = mongoose.model('sync', Sync);
    let found = undefined

    const wait = async () => {
      found = await SyncModel.findOne({})
      if (found.count == 0) {
        found = await SyncModel.findOneAndUpdate({}, {count: found.count + 1}, {new: true})
        await standardVersion(getConfiguration());
        await SyncModel.findOneAndUpdate({}, {count: found.count - 1}, {new: true})
        mongoose.disconnect()
      } else {
        setTimeout(() => {
          wait()
        }, 1000);
      }
    }

    wait()
  } catch (error) {
    core.setFailed(error.stack);
  }
}

run();
