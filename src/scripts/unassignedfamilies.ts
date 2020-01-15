import { DbConfig } from '../config';
import { WKODbAccess } from '../database/WKODbAccess';
import FormUtil from '../FormUtil';
import { IUser } from '../database/Repository';

const dao = new WKODbAccess(DbConfig);

dao.families()
    .findAll({ include_docs: true })
    .then((families: any) => {
        const lessAssignedFamilies = families.filter((doc: any) => {
            return !doc.assignedOs;
        });
        const updatedDocs = lessAssignedFamilies.map((fam: any) => {
            fam.assignedOs = null;
            return fam;
        });
        dao.families()
            .createAll(updatedDocs)
            .then(res => {
                console.log(res);
            });
    });
