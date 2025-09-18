// Virtualização para Listas Grandes - Alça Hub
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'

// Hook para virtualização de lista
export const useVirtualization = (items, itemHeight, containerHeight, overscan = 5) => {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerRef, setContainerRef] = useState(null)
  
  const totalHeight = items.length * itemHeight
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
    items.length - 1
  )
  
  const visibleItems = items.slice(startIndex, endIndex + 1)
  const offsetY = startIndex * itemHeight
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
  }, [])
  
  useEffect(() => {
    if (containerRef) {
      containerRef.addEventListener('scroll', handleScroll)
      return () => containerRef.removeEventListener('scroll', handleScroll)
    }
  }, [containerRef, handleScroll])
  
  return {
    containerRef: setContainerRef,
    visibleItems,
    offsetY,
    totalHeight,
    startIndex,
    endIndex
  }
}

// Hook para virtualização de grid
export const useVirtualGrid = (items, itemWidth, itemHeight, containerWidth, containerHeight, overscan = 5) => {
  const [scrollTop, setScrollTop] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [containerRef, setContainerRef] = useState(null)
  
  const itemsPerRow = Math.floor(containerWidth / itemWidth)
  const totalRows = Math.ceil(items.length / itemsPerRow)
  const totalHeight = totalRows * itemHeight
  const totalWidth = itemsPerRow * itemWidth
  
  const startRow = Math.floor(scrollTop / itemHeight)
  const endRow = Math.min(
    startRow + Math.ceil(containerHeight / itemHeight) + overscan,
    totalRows - 1
  )
  
  const startCol = Math.floor(scrollLeft / itemWidth)
  const endCol = Math.min(
    startCol + Math.ceil(containerWidth / itemWidth) + overscan,
    itemsPerRow - 1
  )
  
  const visibleItems = []
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const index = row * itemsPerRow + col
      if (index < items.length) {
        visibleItems.push({
          item: items[index],
          index,
          row,
          col,
          x: col * itemWidth,
          y: row * itemHeight
        })
      }
    }
  }
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
    setScrollLeft(e.target.scrollLeft)
  }, [])
  
  useEffect(() => {
    if (containerRef) {
      containerRef.addEventListener('scroll', handleScroll)
      return () => containerRef.removeEventListener('scroll', handleScroll)
    }
  }, [containerRef, handleScroll])
  
  return {
    containerRef: setContainerRef,
    visibleItems,
    totalHeight,
    totalWidth,
    itemsPerRow,
    startRow,
    endRow,
    startCol,
    endCol
  }
}

// Hook para virtualização de tabela
export const useVirtualTable = (data, columns, rowHeight, containerHeight, overscan = 5) => {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerRef, setContainerRef] = useState(null)
  
  const totalHeight = data.length * rowHeight
  const startIndex = Math.floor(scrollTop / rowHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / rowHeight) + overscan,
    data.length - 1
  )
  
  const visibleRows = data.slice(startIndex, endIndex + 1)
  const offsetY = startIndex * rowHeight
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
  }, [])
  
  useEffect(() => {
    if (containerRef) {
      containerRef.addEventListener('scroll', handleScroll)
      return () => containerRef.removeEventListener('scroll', handleScroll)
    }
  }, [containerRef, handleScroll])
  
  return {
    containerRef: setContainerRef,
    visibleRows,
    offsetY,
    totalHeight,
    startIndex,
    endIndex,
    columns
  }
}

// Hook para virtualização de árvore
export const useVirtualTree = (treeData, itemHeight, containerHeight, overscan = 5) => {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerRef, setContainerRef] = useState(null)
  const [expandedNodes, setExpandedNodes] = useState(new Set())
  
  const flattenTree = useCallback((nodes, level = 0) => {
    const result = []
    
    nodes.forEach(node => {
      result.push({ ...node, level, visible: true })
      
      if (expandedNodes.has(node.id) && node.children) {
        result.push(...flattenTree(node.children, level + 1))
      }
    })
    
    return result
  }, [expandedNodes])
  
  const flattenedData = useMemo(() => flattenTree(treeData), [treeData, flattenTree])
  
  const totalHeight = flattenedData.length * itemHeight
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
    flattenedData.length - 1
  )
  
  const visibleItems = flattenedData.slice(startIndex, endIndex + 1)
  const offsetY = startIndex * itemHeight
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
  }, [])
  
  const toggleNode = useCallback((nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }, [])
  
  useEffect(() => {
    if (containerRef) {
      containerRef.addEventListener('scroll', handleScroll)
      return () => containerRef.removeEventListener('scroll', handleScroll)
    }
  }, [containerRef, handleScroll])
  
  return {
    containerRef: setContainerRef,
    visibleItems,
    offsetY,
    totalHeight,
    startIndex,
    endIndex,
    toggleNode,
    expandedNodes
  }
}

// Hook para virtualização de timeline
export const useVirtualTimeline = (events, itemHeight, containerHeight, overscan = 5) => {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerRef, setContainerRef] = useState(null)
  
  const totalHeight = events.length * itemHeight
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
    events.length - 1
  )
  
  const visibleEvents = events.slice(startIndex, endIndex + 1)
  const offsetY = startIndex * itemHeight
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
  }, [])
  
  useEffect(() => {
    if (containerRef) {
      containerRef.addEventListener('scroll', handleScroll)
      return () => containerRef.removeEventListener('scroll', handleScroll)
    }
  }, [containerRef, handleScroll])
  
  return {
    containerRef: setContainerRef,
    visibleEvents,
    offsetY,
    totalHeight,
    startIndex,
    endIndex
  }
}

// Hook para virtualização de chat
export const useVirtualChat = (messages, itemHeight, containerHeight, overscan = 5) => {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerRef, setContainerRef] = useState(null)
  const [autoScroll, setAutoScroll] = useState(true)
  
  const totalHeight = messages.length * itemHeight
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
    messages.length - 1
  )
  
  const visibleMessages = messages.slice(startIndex, endIndex + 1)
  const offsetY = startIndex * itemHeight
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
    
    // Verificar se está no final
    const { scrollTop: currentScrollTop, scrollHeight, clientHeight } = e.target
    const isAtBottom = scrollHeight - currentScrollTop === clientHeight
    setAutoScroll(isAtBottom)
  }, [])
  
  const scrollToBottom = useCallback(() => {
    if (containerRef) {
      containerRef.scrollTop = containerRef.scrollHeight
    }
  }, [containerRef])
  
  useEffect(() => {
    if (containerRef) {
      containerRef.addEventListener('scroll', handleScroll)
      return () => containerRef.removeEventListener('scroll', handleScroll)
    }
  }, [containerRef, handleScroll])
  
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom()
    }
  }, [messages.length, autoScroll, scrollToBottom])
  
  return {
    containerRef: setContainerRef,
    visibleMessages,
    offsetY,
    totalHeight,
    startIndex,
    endIndex,
    autoScroll,
    scrollToBottom
  }
}

// Hook para virtualização de galeria
export const useVirtualGallery = (images, itemWidth, itemHeight, containerWidth, containerHeight, overscan = 5) => {
  const [scrollTop, setScrollTop] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [containerRef, setContainerRef] = useState(null)
  
  const itemsPerRow = Math.floor(containerWidth / itemWidth)
  const totalRows = Math.ceil(images.length / itemsPerRow)
  const totalHeight = totalRows * itemHeight
  const totalWidth = itemsPerRow * itemWidth
  
  const startRow = Math.floor(scrollTop / itemHeight)
  const endRow = Math.min(
    startRow + Math.ceil(containerHeight / itemHeight) + overscan,
    totalRows - 1
  )
  
  const startCol = Math.floor(scrollLeft / itemWidth)
  const endCol = Math.min(
    startCol + Math.ceil(containerWidth / itemWidth) + overscan,
    itemsPerRow - 1
  )
  
  const visibleImages = []
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const index = row * itemsPerRow + col
      if (index < images.length) {
        visibleImages.push({
          image: images[index],
          index,
          row,
          col,
          x: col * itemWidth,
          y: row * itemHeight
        })
      }
    }
  }
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
    setScrollLeft(e.target.scrollLeft)
  }, [])
  
  useEffect(() => {
    if (containerRef) {
      containerRef.addEventListener('scroll', handleScroll)
      return () => containerRef.removeEventListener('scroll', handleScroll)
    }
  }, [containerRef, handleScroll])
  
  return {
    containerRef: setContainerRef,
    visibleImages,
    totalHeight,
    totalWidth,
    itemsPerRow,
    startRow,
    endRow,
    startCol,
    endCol
  }
}

// Hook para virtualização de calendário
export const useVirtualCalendar = (events, dayHeight, containerHeight, overscan = 5) => {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerRef, setContainerRef] = useState(null)
  
  const totalHeight = events.length * dayHeight
  const startIndex = Math.floor(scrollTop / dayHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / dayHeight) + overscan,
    events.length - 1
  )
  
  const visibleDays = events.slice(startIndex, endIndex + 1)
  const offsetY = startIndex * dayHeight
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
  }, [])
  
  useEffect(() => {
    if (containerRef) {
      containerRef.addEventListener('scroll', handleScroll)
      return () => containerRef.removeEventListener('scroll', handleScroll)
    }
  }, [containerRef, handleScroll])
  
  return {
    containerRef: setContainerRef,
    visibleDays,
    offsetY,
    totalHeight,
    startIndex,
    endIndex
  }
}

// Hook para virtualização de mapa
export const useVirtualMap = (markers, itemWidth, itemHeight, containerWidth, containerHeight, overscan = 5) => {
  const [scrollTop, setScrollTop] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [containerRef, setContainerRef] = useState(null)
  
  const itemsPerRow = Math.floor(containerWidth / itemWidth)
  const totalRows = Math.ceil(markers.length / itemsPerRow)
  const totalHeight = totalRows * itemHeight
  const totalWidth = itemsPerRow * itemWidth
  
  const startRow = Math.floor(scrollTop / itemHeight)
  const endRow = Math.min(
    startRow + Math.ceil(containerHeight / itemHeight) + overscan,
    totalRows - 1
  )
  
  const startCol = Math.floor(scrollLeft / itemWidth)
  const endCol = Math.min(
    startCol + Math.ceil(containerWidth / itemWidth) + overscan,
    itemsPerRow - 1
  )
  
  const visibleMarkers = []
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const index = row * itemsPerRow + col
      if (index < markers.length) {
        visibleMarkers.push({
          marker: markers[index],
          index,
          row,
          col,
          x: col * itemWidth,
          y: row * itemHeight
        })
      }
    }
  }
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
    setScrollLeft(e.target.scrollLeft)
  }, [])
  
  useEffect(() => {
    if (containerRef) {
      containerRef.addEventListener('scroll', handleScroll)
      return () => containerRef.removeEventListener('scroll', handleScroll)
    }
  }, [containerRef, handleScroll])
  
  return {
    containerRef: setContainerRef,
    visibleMarkers,
    totalHeight,
    totalWidth,
    itemsPerRow,
    startRow,
    endRow,
    startCol,
    endCol
  }
}

// Hook para virtualização de dashboard
export const useVirtualDashboard = (widgets, itemWidth, itemHeight, containerWidth, containerHeight, overscan = 5) => {
  const [scrollTop, setScrollTop] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [containerRef, setContainerRef] = useState(null)
  
  const itemsPerRow = Math.floor(containerWidth / itemWidth)
  const totalRows = Math.ceil(widgets.length / itemsPerRow)
  const totalHeight = totalRows * itemHeight
  const totalWidth = itemsPerRow * itemWidth
  
  const startRow = Math.floor(scrollTop / itemHeight)
  const endRow = Math.min(
    startRow + Math.ceil(containerHeight / itemHeight) + overscan,
    totalRows - 1
  )
  
  const startCol = Math.floor(scrollLeft / itemWidth)
  const endCol = Math.min(
    startCol + Math.ceil(containerWidth / itemWidth) + overscan,
    itemsPerRow - 1
  )
  
  const visibleWidgets = []
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const index = row * itemsPerRow + col
      if (index < widgets.length) {
        visibleWidgets.push({
          widget: widgets[index],
          index,
          row,
          col,
          x: col * itemWidth,
          y: row * itemHeight
        })
      }
    }
  }
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
    setScrollLeft(e.target.scrollLeft)
  }, [])
  
  useEffect(() => {
    if (containerRef) {
      containerRef.addEventListener('scroll', handleScroll)
      return () => containerRef.removeEventListener('scroll', handleScroll)
    }
  }, [containerRef, handleScroll])
  
  return {
    containerRef: setContainerRef,
    visibleWidgets,
    totalHeight,
    totalWidth,
    itemsPerRow,
    startRow,
    endRow,
    startCol,
    endCol
  }
}

// Hook para virtualização de timeline horizontal
export const useVirtualTimelineHorizontal = (events, itemWidth, containerWidth, overscan = 5) => {
  const [scrollLeft, setScrollLeft] = useState(0)
  const [containerRef, setContainerRef] = useState(null)
  
  const totalWidth = events.length * itemWidth
  const startIndex = Math.floor(scrollLeft / itemWidth)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerWidth / itemWidth) + overscan,
    events.length - 1
  )
  
  const visibleEvents = events.slice(startIndex, endIndex + 1)
  const offsetX = startIndex * itemWidth
  
  const handleScroll = useCallback((e) => {
    setScrollLeft(e.target.scrollLeft)
  }, [])
  
  useEffect(() => {
    if (containerRef) {
      containerRef.addEventListener('scroll', handleScroll)
      return () => containerRef.removeEventListener('scroll', handleScroll)
    }
  }, [containerRef, handleScroll])
  
  return {
    containerRef: setContainerRef,
    visibleEvents,
    offsetX,
    totalWidth,
    startIndex,
    endIndex
  }
}

// Exportar tudo
export default {
  useVirtualization,
  useVirtualGrid,
  useVirtualTable,
  useVirtualTree,
  useVirtualTimeline,
  useVirtualChat,
  useVirtualGallery,
  useVirtualCalendar,
  useVirtualMap,
  useVirtualDashboard,
  useVirtualTimelineHorizontal
}
