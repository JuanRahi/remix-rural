import { parseCsv } from "~/utils/csvHelper"
import { supabase } from "~/utils/supabaseClient"

export const procesarVenta = async(url: string, venta: number, comprador: number) => {
    let lecturas: number[] = await parseCsv(url?.toString() || '')  
    
    // insertar venta_lecturas
    const venta_lecturas = lecturas.map(x => ({ caravana: x, venta}))
    const { data: venta_lecturas_insert, error: error_venta_lecturas} = await supabase
        .from('venta_lecturas')
        .insert(venta_lecturas)
      
    if(error_venta_lecturas)
        throw new Response(error_venta_lecturas.message)
    
    // actualizar vacunos ==> propietario, ubicacion, tenedor
    const { data: vacunos_update, error: error_vacunos_update } = await supabase
        .from('vacunos')
        .update({ propietario: comprador, ubicacion: comprador, tenedor: comprador })
        .in('caravana', lecturas)

    console.log(vacunos_update)
    
    if(error_vacunos_update)
        throw new Response(error_vacunos_update.message)
}
