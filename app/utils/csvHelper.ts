import { parse } from 'csv-parse'
import https from 'https'

export function parseCsv(url: string): Promise<number[]>{
    let records: number[] = []
    return new Promise((resolve, reject) => {
        const parser = parse({ columns: true, delimiter: ','})        
        parser.on('data', (data) => records.push(+data.EIC.slice(-8)))
        parser.on('end', () => resolve(records))
        parser.on('error', (error) => reject(error))

        https.get(url, (response) => {
            response.pipe(parser)
        })
    })
}
