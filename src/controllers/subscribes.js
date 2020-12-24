const {
    Chanel,
    Subscribe,
    Video,
    Comment,
    sequelize
} = require('../../models');

const { QueryTypes } = require('sequelize');

const Joi = require('joi');

const addSubscribe = async (req, res) => {
    try {
        const { id } = req.user;
        const { body } = req;

        const isChanelExist = await Chanel.findOne({
            where : {
                id: body.chanelId
            }
        });

        console.log(isChanelExist);

        if(id === body.chanelId){
            return res.send({
                status: 'error',
                error: {
                    message: "Cannot subscribe"
                }
            });
        }

        if(!isChanelExist){
            return res.send({
                status: 'error',
                error: {
                    message: "chanel not exist"
                }
            });
        }

        const isSubscribed = await Subscribe.findOne({
            where: {
                chanelId: body.chanelId,
                subscriberId: id
            }
        });

        const schema = Joi.object({
            chanelId: Joi.number().integer().required()
        });

        const { error } = schema.validate(body);

        if(error){
            return res.send({
                status: 'error',
                error: {
                    message: error.message
                }
            });
        }

        if(isSubscribed){
            return res.send({
                status: 'error',
                error: {
                    message: "Already subscribe to this chanel"
                }
            });
        }

        await Subscribe.create({
            ...body,
            subscriberId: id
        });

        const chanel = await Chanel.findOne({
            where: {
                id: body.chanelId
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'password']
            }
        });

        res.send({
            status: "success",
            data: {
                subscribe: {
                    chanel
                }
            }
        });

    } catch(err){
        console.log(err);
        return res.status(500).send({
            status: "error",
            error: {
                message: "server error"
            }
        });
    }
}

const unSubscribe = async (req, res) => {
    try {
        const { id:subscriberId } = req.user;
        const { chanelId } = req.params;

        const isSubscribed = await Subscribe.findOne({
            where: {
                chanelId,
                subscriberId
            }
        });

        if(!isSubscribed){
            return res.send({
                status: 'error',
                error: {
                    message: "Resource not found"
                }
            });
        }

        isSubscribed.destroy();

        res.send({
            status: "success",
            data: {
                id: chanelId
            }
        })

    } catch(err){
        console.log(err);
        return res.status(500).send({
            status: "error",
            error: {
                message: "server error"
            }
        });
    }
}

const getSubscribtion = async (req, res) => {
    try {
        const { id } = req.user;

        const subscribtion = await sequelize.query(
            `SELECT chanels.id, chanels.email, chanels.chanelName, chanels.description, chanels.cover, chanels.photo FROM "Subscribes" WHERE subscriberId = ${id} LEFT JOIN "Chanels" on subscribes.chanelId = chanels.id`,
            {
              replacements: { status: 'active' },
              type: QueryTypes.SELECT,
              raw: true
            }
        );


        res.send({
            status: "success",
            data : {
                subscribtion
            }
        });

    } catch(err){
        console.log(err);
        return res.status(500).send({
            status: "error",
            error: {
                message: "server error"
            }
        });

    }

}

const getVideosSubscribtion = async (req, res) => {
    try {
        const { id } = req.user;

        const response = await sequelize.query(
            `SELECT videos.id, title, videos.thumbnail, videos.description, video, videos.createdAt, viewCount, chanels.id as chanelId, chanels.email, chanels.chanelName, chanels.description as chanelDescription, chanels.cover, chanels.photo FROM videos LEFT JOIN chanels on chanels.id = videos.chanelId LEFT JOIN subscribes on subscribes.chanelId = chanels.id WHERE subscribes.subscriberId = ${id}`,
            {
              replacements: { status: 'active' },
              type: QueryTypes.SELECT,
              raw: true
            }
        );

        if(!response){
            return res.send({
                status: "error",
                error: {
                    message: "Resource not found"
                }
            });
        }

        const videos = [];

        response.map(video => {
            const tmpData = {
                id: video.id,
                title: video.title,
                description: video.description,
                thumbnail: video.thumbnail,
                video: video.video,
                createdAt: video.createdAt,
                viewCount: video.viewCount,
                chanel: {
                    id: video.chanelId,
                    email: video.email,
                    chanelName: video.chanelName,
                    description: video.description,
                    thumbnail: video.chanelThumb,
                    photo: video.photo
                }
                
            }
            videos.push(tmpData);
        });

        res.send({
            status: "success",
            data : {
                videos
            }
        });

    } catch(err){
        console.log(err);
        return res.status(500).send({
            status: "error",
            error: {
                message: "server error"
            }
        });

    }
}

const checkSubscribe = async (req, res) => {
    try {
        const { id } = req.user;
        const { body } = req;

        const isChanelExist = await Chanel.findOne({
            where : {
                id: body.chanelId
            }
        });

        if(id === body.chanelId){
            return res.send({
                status: 'error',
                error: {
                    message: "Cannot subscribe"
                }
            });
        }

        if(!isChanelExist){
            return res.send({
                status: 'error',
                error: {
                    message: "chanel not exist"
                }
            });
        }

        const isSubscribed = await Subscribe.findOne({
            where: {
                chanelId: body.chanelId,
                subscriberId: id
            }
        });

        if(!isSubscribed){
            return res.send({
                status: 'error',
                error: {
                    message: "resource not found"
                }
            });
        }

        res.send({
            status: "success",
            data: {
                subscribe: isSubscribed
            }
        });



    } catch(err){
        console.log(err);
    }
}

exports.addSubscribe = addSubscribe;
exports.unSubscribe = unSubscribe;
exports.getSubscribtion = getSubscribtion;
exports.getVideosSubscribtion = getVideosSubscribtion;
exports.checkSubscribe = checkSubscribe;