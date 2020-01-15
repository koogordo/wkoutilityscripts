import { DbConfig } from '../config';
import { WKODbAccess } from '../database/WKODbAccess';
import FormUtil from '../FormUtil';
import { IUser } from '../database/Repository';

const dao = new WKODbAccess(DbConfig);

dao.users()
    .findBySelector({
        selector: {
            'roles.0': 'OS',
        },
    })
    .then(users => {
        return users.map((user: any) => {
            return user.name;
        });
    })
    .then(osUsernames => {
        return dao
            .forms()
            .findAll({ include_docs: true })
            .then(forms => {
                return [osUsernames, forms];
            });
    })
    .then(([osUsernames, forms]) => {
        const templateMap = new Map<any, any>();

        for (const form of forms) {
            if (!templateMap.has(form.form.name)) {
                templateMap.set(form.form.name, form);
            }
        }
        return [osUsernames, templateMap];
    })
    .then(([osUsernames, templateMap]) => {
        const promises = osUsernames.map((osUsername: any) => {
            return dao
                .visits(osUsername)
                .findAll({ include_docs: true })
                .then(visitDocs => {
                    const updatedVisitDocs = visitDocs.map((visitDoc: any) => {
                        if (!FormUtil.isCompressed(visitDoc)) {
                            visitDoc.form = FormUtil.compress(visitDoc.form);
                        }
                        return visitDoc;
                    });
                    return dao
                        .visits(osUsername)
                        .createAll(updatedVisitDocs)
                        .then(res => {
                            return res;
                        })
                        .then(err => {
                            return err;
                        })
                        .catch(err => {
                            console.log(err);
                        });
                })
                .catch(err => {
                    console.log(err);
                });
        });

        Promise.all(promises)
            .then(reses => {
                console.log(reses);
            })
            .catch(err => {
                console.log(err);
            });
    })
    .catch(err => {
        console.log(err);
    });
