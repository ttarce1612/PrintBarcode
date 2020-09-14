/**
 * Query parser
 * Modified by: Huy Nghiem
 * Modified date: 2020/02/03
 */

exports.filterParser = (params) => {
    let options = {
        sort: { _id: -1  },
        page: parseInt(params.page),
        limit: parseInt(params.limit || 5),
    };
    let query = {};

    let keyword = (params.keyword) || "";
    if (keyword) {
        keyword = new RegExp(keyword, 'ig');
        const fields = ['code', 'item', 'unit']
        query['$or'] = [];
        fields.map(function (item) {
            let opt = {};
            opt[item] = keyword;
            opt['isdeleted'] = 0;
            query['$or'].push(opt)
        });
    } else {
        query['isdeleted'] = 0;
    }
    return {
        query: query,
        options: options
    }
}