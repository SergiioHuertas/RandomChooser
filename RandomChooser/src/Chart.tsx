"use client"

import { useState, useRef, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts'
import { Button } from "./components/ui/button" 
import { Input } from "./components/ui/input"
import { Label as UILabel } from "./components/ui/label"
import { X } from "lucide-react"

interface Option {
  id: number;
  name: string;
  color: string;
}

const COLORS = ['#00FFFF', '#FF00FF', '#FFFF00', '#00FF00', '#FF0000', '#0000FF', '#FF8000', '#8000FF', '#0080FF']

export default function Chart() {
  const [options, setOptions] = useState<Option[]>([])
  const [newOptionName, setNewOptionName] = useState('')
  const [newOptionColor, setNewOptionColor] = useState('')
  const [selectedOption, setSelectedOption] = useState<Option | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotationAngle, setRotationAngle] = useState(0)
  const spinIntervalRef = useRef<number | null>(null)

  const addOption = (e: React.FormEvent) => {
    e.preventDefault()
    if (newOptionName.trim() !== '') {
      const color = newOptionColor || COLORS[Math.floor(Math.random() * COLORS.length)]
      setOptions([...options, { id: Date.now(), name: newOptionName.trim(), color }])
      setNewOptionName('')
      setNewOptionColor('')
    }
  }

  const removeOption = (id: number) => {
    setOptions(options.filter(option => option.id !== id))
    if (selectedOption?.id === id) {
      setSelectedOption(null)
    }
  }

  const selectRandomOption = () => {
    if (options.length > 0 && !isSpinning) {
        setRotationAngle(0);
        setSelectedOption(null);
        setIsSpinning(true);
        if (spinIntervalRef.current) cancelAnimationFrame(spinIntervalRef.current);

        const startTime = performance.now();
        const duration = 10000; // 10 segundos
        const minRotations = 3;

        // Determina la opción ganadora
        const winningIndex = Math.floor(Math.random() * options.length);

        // Calcula el ángulo por opción
        const anglePerOption = 360 / options.length;
        
        // Calcula el ángulo necesario para que el indicador quede alineado con la opción ganadora
        const targetAngle = anglePerOption * winningIndex;

        // Rotación total para que la opción ganadora quede alineada con el indicador
        const totalRotation = 360 * minRotations + (targetAngle) - (anglePerOption / 2);

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Función de suavizado para la desaceleración
            const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

            let angle;
            if (progress < 1) { // Hasta el 99% del tiempo total, usa easing
                angle = totalRotation * easeOut(progress);
            } else {
                // Ajuste final preciso en el último 1% del tiempo
                angle = totalRotation;
            }

            setRotationAngle(angle % 360);

            if (progress < 1) {
                spinIntervalRef.current = requestAnimationFrame(animate);
            } else {
                setIsSpinning(false);
                setSelectedOption(options[winningIndex]);
            }
        };

        spinIntervalRef.current = requestAnimationFrame(animate);
    }
};



  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) cancelAnimationFrame(spinIntervalRef.current)
    }
  }, [])

  const data = options.map(option => ({
    name: option.name,
    value: 1,
    color: option.color
  }))

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        style={{ pointerEvents: 'none' }}
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    )
  }

  return (
    <div className="flex w-full h-full flex-col items-center justify-center space-y-6 p-6 bg-gray-900 text-cyan-300 rounded-lg shadow-lg shadow-cyan-500/50">
      <form onSubmit={addOption} className="w-full max-w-xs flex flex-col space-y-2">
        <Input
          type="text"
          value={newOptionName}
          onChange={(e) => setNewOptionName(e.target.value)}
          placeholder="Nombre de la opción"
          className="flex-grow bg-gray-800 border-cyan-500 text-cyan-300 placeholder-cyan-600"
        />
        <div className="flex space-x-2">
          <Input
            type="color"
            value={newOptionColor}
            onChange={(e) => setNewOptionColor(e.target.value)}
            className="w-12 h-10 p-1 bg-gray-800 border-cyan-500"
          />
          <Button type="submit" className="flex-grow bg-cyan-600 hover:bg-cyan-700 text-white">Añadir</Button>
        </div>
      </form>
      
      <div className="w-full max-w-xs">
        <UILabel className="text-cyan-300">Opciones actuales:</UILabel>
        <ul className="mt-2 space-y-2">
          {options.map(option => (
            <li key={option.id} className="flex justify-between items-center bg-gray-800 p-2 rounded">
              <span style={{color: option.color}}>{option.name}</span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => removeOption(option.id)}
                aria-label={`Eliminar ${option.name}`}
                className="text-cyan-300 hover:text-cyan-100 hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
      
      {options.length > 0 && (
        <>
          <div className="w-full h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  labelLine={false}
                  label={CustomLabel}
                  style={{ transform: `rotate(${rotationAngle}deg)`, transformOrigin: 'center' }}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke={selectedOption?.name === entry.name ? "#FFF" : "none"}
                      strokeWidth={selectedOption?.name === entry.name ? 4 : 0}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Indicator */}
            <div 
              className="absolute top-0 left-1/2 w-1 h-16 bg-white transform -translate-x-1/2"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(0,0,0,1) 100%)'
              }}
            ></div>
          </div>
          
          <Button 
            onClick={selectRandomOption} 
            disabled={isSpinning}
            className="bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-gray-600"
          >
            {isSpinning ? 'Girando...' : 'Seleccionar Opción Aleatoria'}
          </Button>
          
          {selectedOption && !isSpinning && (
            <div className="text-center font-semibold text-2xl text-cyan-300 animate-pulse">
              Opción seleccionada: {selectedOption.name}
            </div>
          )}
        </>
      )}
    </div>
  )
}