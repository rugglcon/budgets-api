import * as express from 'express';
import * as bodyParser from 'body-parser';

class App {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.config();
    }

    config(): void {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({extended: false}));
    }

    routes(): void {
        const router = express.Router();

        router.get('/', (req, res) => {
            res.status(200).send({
                message: 'hello'
            });
        });

        router.post('/', (req, res) => {
            const data = req.body;
            res.status(200).send(data);
        });

        this.app.use('/', router);
    }
}
export default new App().app;