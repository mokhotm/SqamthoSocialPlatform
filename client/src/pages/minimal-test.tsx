// Minimal test component with no dependencies
export default function MinimalTest() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Minimal Test Page</h1>
      <p style={{ marginTop: '10px' }}>
        This page uses no custom hooks or complex components.
      </p>
      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        border: '1px solid #ccc', 
        borderRadius: '8px' 
      }}>
        <p>If you can see this page, basic React rendering is working.</p>
      </div>
    </div>
  );
}
