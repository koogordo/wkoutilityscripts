import { DbConfig } from '../config';
import { WKODbAccess } from '../database/WKODbAccess';
import FormUtil from '../FormUtil';
import { IUser } from '../database/Repository';

const dao = new WKODbAccess(DbConfig);

dao.users()
    .query('review_groups/byRole', { include_docs: true, key: 'OS' })
    .then(osesPayload => {
        const osNames = osesPayload.rows.map((row: any) => {
            return row.doc.name;
        });
        return osNames;
    })
    .then(osDBNames => {
        const osClientDocsPromises = osDBNames.map((name: any) => {
            return dao
                .osClients(name)
                .find('clients')
                .then(osClientDoc => {
                    osClientDoc.os = name;
                    return osClientDoc;
                });
        });
        return Promise.all(osClientDocsPromises).then(osClientDocs => {
            return osClientDocs;
        });
    })
    .then(clientDocs => {
        const allAssignedFamilyPromises = clientDocs.map((clientDoc: any) => {
            const osAssignedFamilyPromises = clientDoc.clients.map(
                (family: any) => {
                    return dao
                        .families()
                        .find(family.familyID)
                        .then((familyDoc: any) => {
                            familyDoc.assignedOs = clientDoc.os;
                            return dao
                                .families()
                                .update(familyDoc)
                                .then(familyUpdateRes => {
                                    return familyUpdateRes;
                                })
                                .catch(err => {
                                    return err;
                                });
                        })
                        .catch(err => {
                            return err;
                        });
                }
            );
            return Promise.all(osAssignedFamilyPromises)
                .then(familyUpdateResesForOs => {
                    return familyUpdateResesForOs;
                })
                .catch(err => err);
        });

        Promise.all(allAssignedFamilyPromises)
            .then(allAssignedFamiliesReses => {
                console.log(allAssignedFamiliesReses);
            })
            .catch(err => err);
    });
