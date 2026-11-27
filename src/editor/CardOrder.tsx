import { createContext, useContext, Fragment, type ReactNode } from "react";
import { Content, useField } from "./content";

export const CardOrderContext = createContext<{ key: string; id: string; label: string } | null>(null);

export default function CardOrder<T>({ id, items, identity, label, children }: {
  id: string; items: readonly T[];
  identity: (item:T,index:number) => string;
  label: (item:T) => string;
  children: (item:T,index:number) => ReactNode;
}) {
  const key = useField(`card-order-${id}`);
  const {fields,editing} = useContext(Content);
  const value = fields[key];
  const rows = items.map((item,index)=>({ item, index, id:identity(item,index) }));
  const order = value?.kind === "order" ? value.ids : [];
  const list = order.length ? [
    ...order.flatMap(id=>rows.filter(row=>row.id === id)),
    ...rows.filter(row=>!order.includes(row.id)),
  ] : rows;

  return <>{list.map(row=>{
    const card = children(row.item,row.index);
    return editing ? <CardOrderContext.Provider key={row.id} value={{key,id:row.id,label:label(row.item)}}>{card}</CardOrderContext.Provider>
      : <Fragment key={row.id}>{card}</Fragment>;
  })}</>;
}
