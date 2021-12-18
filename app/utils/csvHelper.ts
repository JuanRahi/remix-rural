import { parse } from 'csv-parse'
import { createReadStream } from 'fs'

export function parseCsv(){
    let records = []
    return new Promise((resolve, reject) => {
        const parser = parse({ columns: true, delimiter: ','})        
        parser.on('data', (data) => records.push(data.EIC.slice(-8)))
        parser.on('end', () => resolve(records))
        parser.on('error', (error) => reject(error))

        createReadStream(__dirname+'/control.csv')
            .pipe(parser)

    })
}
