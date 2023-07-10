import React, { Component } from 'react';
import { MapContainer, Marker, Popup, TileLayer, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {Card} from 'primereact/card'
import {DataTable} from 'primereact/datatable'
import {Column} from 'primereact/column'

import styles from '@/styles/Home.module.css';

export default class Mapview extends Component {
  render() {
    const { puntos } = this.props;

    const trueIcon = L.icon({
      iconUrl: './img/antena_nueva.svg',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      className: styles.trueIcon
    });

    const falseIcon = L.icon({
      iconUrl: './img/antena_nueva.svg',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      className: styles.falseIcon
    });

    return (
      <div className={styles.mapview}>
        <MapContainer className={styles.mapa} center={{ lat: -0.238679, lng: -79.168436 }} zoom={13} scrollWheelZoom={true}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          />
          {puntos.map((punto, index) => (
            <Marker
              key={index}
              position={[punto.lat, punto.long]}
              icon={punto.estado ? trueIcon : falseIcon}
            >
              <Popup maxWidth={800}>
                <Card title={punto.nombre}  style={{minWidth:'500px'}}>
                  LONGITUD: {punto.long}<br/>
                  LATITUD: {punto.lat}<br/>
                  <DataTable value={punto.historial} paginator 
                  stripedRows rows={5} style={{minWidth:'500px'}} >
                    <Column field='fecha' header='FECHA' />
                    <Column field='hora' header='HORA' />
                    <Column field='estado' header='ESTADO' />
                  </DataTable>
                </Card>
              </Popup>
              <Tooltip permanent>{punto.nombre}</Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>
    );
  }
}
