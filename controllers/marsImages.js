/**
 * render marsImages page if connected.
 */
exports.get = (req, res, next) => {
    if(req.session.connected) {
        res.render('marsImages', {
            title: 'Mars Images',
            firstName: req.session.firstName,
            lastName: req.session.lastName,
        });
    }
    else
        res.redirect('/login');
};
