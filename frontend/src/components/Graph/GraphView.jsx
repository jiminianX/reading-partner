import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as d3 from 'd3';
import { useTheme } from '../../hooks/useTheme';
import { ThemeToggleButton, useThemeTransition } from '../Common/ThemeToggleButton';
import Logo from '../Common/Logo';
import { getAllReadings, getAllLinks } from '../../services/storage';
import './GraphView.css';

export default function GraphView() {
    const { theme, toggleTheme } = useTheme();
    const { startTransition } = useThemeTransition();
    const svgRef = useRef(null);
    const simulationRef = useRef(null);

    const [readings, setReadings] = useState([]);
    const [links, setLinks] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleThemeToggle = () => {
        startTransition(() => toggleTheme());
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const [readingsData, linksData] = await Promise.all([
                    getAllReadings(),
                    getAllLinks()
                ]);
                setReadings(readingsData);
                setLinks(linksData);
            } catch (error) {
                console.error('Error loading graph data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const renderGraph = useCallback(() => {
        if (!svgRef.current || readings.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const container = svgRef.current.parentElement;
        const width = container.clientWidth;
        const height = container.clientHeight;

        svg.attr('width', width).attr('height', height);

        // Build nodes and edges
        const nodes = readings.map(r => ({
            id: r.id,
            name: r.fileName || r.name || 'Untitled',
            ...r
        }));

        const nodeIds = new Set(nodes.map(n => n.id));
        const edges = links
            .filter(l => nodeIds.has(l.sourceReadingId) && nodeIds.has(l.targetReadingId))
            .map(l => ({
                source: l.sourceReadingId,
                target: l.targetReadingId,
                id: l.id
            }));

        // Count connections per node
        const connectionCount = {};
        edges.forEach(e => {
            connectionCount[e.source] = (connectionCount[e.source] || 0) + 1;
            connectionCount[e.target] = (connectionCount[e.target] || 0) + 1;
        });

        const g = svg.append('g');

        // Zoom
        const zoom = d3.zoom()
            .scaleExtent([0.3, 3])
            .on('zoom', (event) => g.attr('transform', event.transform));
        svg.call(zoom);

        // Simulation
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(edges).id(d => d.id).distance(120))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(40));

        simulationRef.current = simulation;

        // Edges
        const link = g.append('g')
            .attr('class', 'graph-links')
            .selectAll('line')
            .data(edges)
            .enter()
            .append('line')
            .attr('class', 'graph-edge')
            .attr('stroke-width', 1.5);

        // Node groups
        const node = g.append('g')
            .attr('class', 'graph-nodes')
            .selectAll('g')
            .data(nodes)
            .enter()
            .append('g')
            .attr('class', 'graph-node')
            .call(d3.drag()
                .on('start', (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on('end', (event, d) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                })
            );

        // Node circles
        node.append('circle')
            .attr('r', d => 12 + (connectionCount[d.id] || 0) * 3)
            .attr('class', 'node-circle');

        // Node labels
        node.append('text')
            .text(d => {
                const name = d.name;
                return name.length > 18 ? name.slice(0, 16) + '...' : name;
            })
            .attr('dy', d => 22 + (connectionCount[d.id] || 0) * 3)
            .attr('text-anchor', 'middle')
            .attr('class', 'node-label');

        // Click to select
        node.on('click', (event, d) => {
            event.stopPropagation();
            setSelectedNode(d);
            node.selectAll('.node-circle').classed('selected', false);
            d3.select(event.currentTarget).select('.node-circle').classed('selected', true);
        });

        svg.on('click', () => {
            setSelectedNode(null);
            node.selectAll('.node-circle').classed('selected', false);
        });

        // Hover
        node.on('mouseenter', function () {
            d3.select(this).select('.node-circle').classed('hovered', true);
        }).on('mouseleave', function () {
            d3.select(this).select('.node-circle').classed('hovered', false);
        });

        // Tick
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        return () => simulation.stop();
    }, [readings, links]);

    useEffect(() => {
        if (!loading) renderGraph();
    }, [loading, renderGraph]);

    // Resize handler
    useEffect(() => {
        const handleResize = () => {
            if (!loading) renderGraph();
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [loading, renderGraph]);

    const getNodeLinks = (nodeId) => {
        return links.filter(l => l.sourceReadingId === nodeId || l.targetReadingId === nodeId);
    };

    return (
        <div className="graph-page">
            <div className="graph-film-grain" />

            <nav className="graph-nav">
                <div className="graph-nav-left">
                    <Logo size={32} />
                    <span className="graph-nav-title">Reading Partner</span>
                    <Link to="/app" className="graph-back-link">
                        ← Back to readings
                    </Link>
                </div>
                <div className="graph-nav-right">
                    <ThemeToggleButton
                        theme={theme}
                        variant="circle"
                        start="top-right"
                        onClick={handleThemeToggle}
                    />
                </div>
            </nav>

            <div className="graph-body">
                <div className="graph-container">
                    {loading ? (
                        <div className="graph-loading">
                            <div className="loading-spinner" />
                            <p>Loading graph...</p>
                        </div>
                    ) : readings.length === 0 ? (
                        <div className="graph-empty">
                            <p className="graph-empty-title">No readings yet</p>
                            <p className="graph-empty-hint">
                                Upload PDFs and create notes with [[links]] to see your knowledge graph
                            </p>
                            <Link to="/app" className="btn">
                                Start Reading
                            </Link>
                        </div>
                    ) : (
                        <svg ref={svgRef} />
                    )}
                </div>

                <div className={`graph-sidebar ${selectedNode ? 'open' : ''}`}>
                    {selectedNode ? (
                        <>
                            <div className="graph-sidebar-header">
                                <h3>{selectedNode.name}</h3>
                                <button
                                    className="graph-sidebar-close"
                                    onClick={() => setSelectedNode(null)}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="graph-sidebar-content">
                                {selectedNode.createdAt && (
                                    <div className="graph-detail">
                                        <span className="graph-detail-label">Added</span>
                                        <span className="graph-detail-value">
                                            {new Date(
                                                selectedNode.createdAt.seconds
                                                    ? selectedNode.createdAt.seconds * 1000
                                                    : selectedNode.createdAt
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                                <div className="graph-detail">
                                    <span className="graph-detail-label">Connections</span>
                                    <span className="graph-detail-value">
                                        {getNodeLinks(selectedNode.id).length}
                                    </span>
                                </div>

                                {getNodeLinks(selectedNode.id).length > 0 && (
                                    <div className="graph-connections">
                                        <span className="graph-detail-label">Linked Readings</span>
                                        {getNodeLinks(selectedNode.id).map(link => {
                                            const otherId = link.sourceReadingId === selectedNode.id
                                                ? link.targetReadingId
                                                : link.sourceReadingId;
                                            const other = readings.find(r => r.id === otherId);
                                            return (
                                                <div key={link.id} className="graph-connection-item">
                                                    {other?.fileName || other?.name || 'Unknown'}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <Link
                                    to="/app"
                                    className="btn graph-open-btn"
                                >
                                    Open Reading
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="graph-sidebar-empty">
                            <p>Click a node to see details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
