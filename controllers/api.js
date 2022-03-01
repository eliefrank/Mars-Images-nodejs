const db = require('../models');

/**
 * middleware - check if connected. if connected continues, else returns status 404.
 */
exports.isConnected = (req, res, next) => {
    if(req.session.connected)
        next();
    else
        return res.status(404).send();
};

/** Checks if the email already exists in a database */
exports.postEmailCheck = (req, res) => {
    return db.User.findOne({where: {email: req.body.email}})
        .then((user) => {
            res.send({ emailAlreadyExists: user ? true : false });
        })
        .catch((err) => {
            console.log('*** There was an error querying user', JSON.stringify(err));
            return res.status(400).send(err);
        });
};

/** Returns the list of saved images of the user. */
exports.getSavedImages = (req, res) => {
    return db.MarsImage.findAll({where: {email: req.session.connected}})
            .then((savedImages) => res.send(savedImages))
            .catch((err) => {
                console.log('*** There was an error querying mars images', JSON.stringify(err));
                return res.status(400).send(err);
            });
};

/**
 * Saving an image in a database if it does not already exist in the database (in the username).
 */
exports.postSaveImg = (req, res) => {
    const email = req.session.connected;
    const { url, imageId, earthDate, sol, camera } = req.body;

    return db.MarsImage.findOrCreate({
                where: {imageId: imageId, email: email},
                defaults: { url, imageId, earthDate, sol, camera, email }
            })
            .then((image) => res.send(image))
            .catch((err) => {
                console.log('*** error finding or creating a image', JSON.stringify(err));
                return res.status(400).send(err);
            });
};

/** Deleting an image from the database. */
exports.deleteImg = (req, res) => {
    return db.MarsImage.destroy({where: {imageId: req.body.imageId ,email: req.session.connected}})
            .then((deleted) => res.send({deleted}))
            .catch((err) => {
                console.log('*** Error deleting image', JSON.stringify(err));
                res.status(400).send(err);
            })
};

/** Deleting all images in the database (by username). */
exports.deleteAllImages = (req, res) => {
    return db.MarsImage.destroy({where: {email: req.session.connected}})
            .then((deleted) => res.send({deleted}))
            .catch((err) => {
                console.log('*** Error deleting all images', JSON.stringify(err));
                res.status(400).send(err);
            })
};
