import { DbConfig } from './config';
import { WKODbAccess } from './database/WKODbAccess';

const newDa = () => {
    return new WKODbAccess(DbConfig);
};
