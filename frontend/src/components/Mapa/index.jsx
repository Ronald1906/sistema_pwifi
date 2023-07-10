import dynamic from "next/dynamic";

const Map= dynamic(()=>import('@/components/Mapa/Mapview'),{
    ssr:false
})

export default Map