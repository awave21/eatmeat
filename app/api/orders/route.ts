import {getDb} from '../../../db';
import {orders} from '../../../db/schema';
import {eq} from 'drizzle-orm';
import {deliveryDate,PRICE,drinks} from '../../../lib/menu';
export async function POST(request:Request){
 try{
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Недопустимый источник запроса'},{status:403});
 if(Number(request.headers.get('content-length')||0)>10000)return Response.json({error:'Слишком большой запрос'},{status:413});
 const raw=await request.text();if(raw.length>10000)return Response.json({error:'Слишком большой запрос'},{status:413});const b=JSON.parse(raw);
 const validText=(x:unknown,min:number,max:number)=>typeof x==='string'&&x.trim().length>=min&&x.length<=max;
 if(!validText(b.name,2,80)||!validText(b.phone,10,20)||!/^[+0-9() \-]{10,20}$/.test(b.phone)||b.phone.replace(/\D/g,'').length<10||!validText(b.city,2,80)||!validText(b.address,5,200)||!Array.isArray(b.selected)||b.selected.length!==4||!b.selected.every((x:unknown)=>Number.isInteger(x)&&Number(x)>=0&&Number(x)<3)||!Number.isInteger(b.quantity)||b.quantity<1||b.quantity>20||!validText(b.key,36,36)||!validText(b.apartment||'',0,30)||!validText(b.entrance||'',0,40)||!validText(b.comment||'',0,400))return Response.json({error:'Проверьте контактные данные, адрес и четыре выбранных блюда.'},{status:400});
 if(b.date!==deliveryDate())return Response.json({error:'Изменился срок приёма заказов. Обновите страницу: доставка доступна на '+deliveryDate()+'.'},{status:409});
 if(b.drink!=null&&!drinks.some(d=>d.id===b.drink))return Response.json({error:'Выберите чай, компот, морс или вариант без напитка.'},{status:400});
 const db=getDb();const existing=await db.select({id:orders.id}).from(orders).where(eq(orders.idempotencyKey,b.key)).get();if(existing)return Response.json({id:existing.id});
 const id=crypto.randomUUID();await db.insert(orders).values({id,idempotencyKey:b.key,createdAt:new Date().toISOString(),deliveryDate:b.date,customer:b.name.trim(),phone:b.phone,address:JSON.stringify({city:b.city,address:b.address,apartment:b.apartment||'',entrance:b.entrance||'',comment:b.comment||''}),items:JSON.stringify(b.selected),drink:b.drink||null,quantity:b.quantity,total:b.quantity*PRICE,status:'test'}).onConflictDoNothing();
 const saved=await db.select({id:orders.id}).from(orders).where(eq(orders.idempotencyKey,b.key)).get();return Response.json({id:saved?.id||id},{status:201});
 }catch(e){console.error('Order save failed',e instanceof Error?e.message:'unknown');return Response.json({error:'Не удалось сохранить заказ. Повторите попытку.'},{status:500})}
}
