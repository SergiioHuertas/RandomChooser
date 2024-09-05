"use client"

import { useState, useRef, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Button } from "./components/ui/button" 
import { Input } from "./components/ui/input"
import { Label as UILabel } from "./components/ui/label"
import { X, Edit2, Check } from "lucide-react"
import { COLORS } from './utils/const.ts';

interface Option {
  id: number;
  name: string;
  color: string;
}

export default function Chart() {
  const [options, setOptions] = useState<Option[]>([])
  const [newOptionName, setNewOptionName] = useState('')
  const [newOptionColor, setNewOptionColor] = useState('')
  const [selectedOption, setSelectedOption] = useState<Option | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotationAngle, setRotationAngle] = useState(0)
  const [editingOptionId, setEditingOptionId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
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

  const updateOptionColor = (id: number, newColor: string) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, color: newColor } : option
    ))
  }

  const startEditing = (option: Option) => {
    setEditingOptionId(option.id)
    setEditingName(option.name)
  }

  const saveEdit = () => {
    if (editingOptionId !== null) {
      setOptions(options.map(option =>
        option.id === editingOptionId ? { ...option, name: editingName.trim() } : option
      ))
      setEditingOptionId(null)
      setEditingName('')
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
    const sin = Math.sin(-midAngle * RADIAN)
    const cos = Math.cos(-midAngle * RADIAN)
    const textAnchor = (cos >= 0 ? 'start' : 'end')

    // Split the name into words
    const words = name.split(' ')
    const lines = []
    let currentLine = ''

    // Create lines that fit within the sector
    words.forEach((word: string) => {
      if ((currentLine + word).length <= 10) {
        currentLine += (currentLine ? ' ' : '') + word
      } else {
        lines.push(currentLine)
        currentLine = word
      }
    })
    if (currentLine) {
      lines.push(currentLine)
    }

    return (
      <g>
        {lines.map((line: string, index: number) => (
          <text
            key={index}
            x={x}
            y={y + (index - (lines.length - 1) / 2) * 12}
            fill="white"
            textAnchor={textAnchor}
            dominantBaseline="central"
            style={{ fontSize: '15px', fontWeight: 'bold', pointerEvents: 'none' }}
          >
            {line}
          </text>
        ))}
      </g>
    )
  }

  return (
    <div className="flex w-full h-full flex-col items-center justify-center space-y-6 p-6 bg-gray-900 text-cyan-300 rounded-lg shadow-lg shadow-cyan-500/50">
      <div className="w-full text-center mb-8">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
          Quantum Selector
        </h1>
        <p className="text-xl mt-2 text-cyan-400">Tu ruleta aleatoria futurista
        </p>
      </div>
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
              {editingOptionId === option.id ? (
                <Input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-grow bg-gray-700 border-cyan-500 text-cyan-300"
                />
              ) : (
                <span style={{color: option.color}}>{option.name}</span>
              )}
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={option.color}
                  onChange={(e) => updateOptionColor(option.id, e.target.value)}
                  className="w-14 h-10 p-0 bg-transparent border-none"
                />
                {editingOptionId === option.id ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={saveEdit}
                    aria-label="Guardar"
                    className="text-green-500 hover:text-green-400 hover:bg-gray-700"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEditing(option)}
                    aria-label={`Editar ${option.name}`}
                    disabled={isSpinning}
                    className={`${isSpinning ? 'cursor-not-allowed opacity-50' : ''} text-cyan-300 hover:text-cyan-100 hover:bg-gray-700`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeOption(option.id)}
                  aria-label={`Eliminar ${option.name}`}
                  disabled={isSpinning}
                  className={`${isSpinning ? 'cursor-not-allowed opacity-50' : ''} text-cyan-300 hover:text-cyan-100 hover:bg-gray-700`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
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
                  label={selectedOption ? null : CustomLabel}
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
            {/*<div 
              className="absolute top-0 left-1/2 w-1 h-16 bg-white transform -translate-x-1/2"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(0,0,0,1) 100%)'
              }}
            ></div>*/}
          </div>
          
          <Button 
            onClick={selectRandomOption} 
            disabled={isSpinning || editingOptionId !== null}
            className="bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-gray-600"
          >
            {isSpinning ? 'Girando...' : 'Seleccionar opción aleatoria'}
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