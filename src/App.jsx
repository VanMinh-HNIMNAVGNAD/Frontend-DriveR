import MainLayout from './components/layout/MainLayout';

function App() {
  return (
      <MainLayout>
        <div>
          <h2 className="text-2xl font-normal mb-6 text-gray-800">Drive của tôi</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-40 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400">
              Mock Folder/File
            </div>
          </div>
        </div>
      </MainLayout>
  );
}

export default App;