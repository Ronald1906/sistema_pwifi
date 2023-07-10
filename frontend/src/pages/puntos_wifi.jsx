import Layout from '@/components/Layout';
import Mapview from '@/components/Mapa/';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const Puntos_wifi = () => {
  const [PuntosMap, setPuntosMap] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get(process.env.NEXT_PUBLIC_BACKEND + 'puntos_wifi');
        setPuntosMap(result.data);
      } catch (error) {
        Swal.fire({
          title: '¡Error!',
          icon:'warning',
          text:'Se produjo un error al obtener los puntos wifi'
        })
        console.error('Error al obtener los puntos WiFi', error);
      }
    };

    // Ejecutar la función fetchData al inicio y luego cada 10 minutos
    fetchData();
    const interval = setInterval(fetchData, 2 * 60 * 1000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <Mapview puntos={PuntosMap} />
    </Layout>
  );
};

export default Puntos_wifi;
