import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '/components/ui/card';
import { Button } from '/components/ui/button';
import { Input } from '/components/ui/input';
import { Label } from '/components/ui/label';
import { Textarea } from '/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, FileText, AlertCircle, Upload, Search, Plus, Edit, Trash, Download, Calendar, Mail, Bell, Star } from 'lucide-react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  startDate: string;
  salary: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface Review {
  id: string;
  employeeId: string;
  reviewDate: string;
  reviewType: 'Annual' | 'Mid-Year' | 'Probation' | '90-Day';
  overallRating: number;
  performance: {
    quality: number;
    productivity: number;
    communication: number;
    teamwork: number;
    leadership: number;
  };
  goals: string;
  achievements: string;
  areasForImprovement: string;
  comments: string;
  reviewerId: string;
  nextReviewDate: string;
}

interface Document {
  id: string;
  employeeId: string;
  fileName: string;
  fileType: string;
  category: 'Medical' | 'Contract' | 'Certificate' | 'Performance' | 'Personal' | 'Other';
  uploadDate: string;
  description: string;
  fileData: string;
}

interface Incident {
  id: string;
  employeeId: string;
  incidentDate: string;
  incidentType: 'Disciplinary' | 'Safety' | 'Harassment' | 'Attendance' | 'Performance' | 'Other';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  actionTaken: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  reportedBy: string;
  witnesses: string;
  followUpDate: string;
}

const HRManagementApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const [showAddIncident, setShowAddIncident] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showUploadDoc, setShowUploadDoc] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedEmployees = localStorage.getItem('hr-employees');
    const savedReviews = localStorage.getItem('hr-reviews');
    const savedDocuments = localStorage.getItem('hr-documents');
    const savedIncidents = localStorage.getItem('hr-incidents');

    if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
    if (savedReviews) setReviews(JSON.parse(savedReviews));
    if (savedDocuments) setDocuments(JSON.parse(savedDocuments));
    if (savedIncidents) setIncidents(JSON.parse(savedIncidents));
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('hr-employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('hr-reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('hr-documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('hr-incidents', JSON.stringify(incidents));
  }, [incidents]);

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee = {
      ...employee,
      id: Date.now().toString()
    };
    setEmployees([...employees, newEmployee]);
    setShowAddEmployee(false);
  };

  const updateEmployee = (updatedEmployee: Employee) => {
    setEmployees(employees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
    setEditingEmployee(null);
  };

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
    setReviews(reviews.filter(rev => rev.employeeId !== id));
    setDocuments(documents.filter(doc => doc.employeeId !== id));
    setIncidents(incidents.filter(inc => inc.employeeId !== id));
  };

  const addReview = (review: Omit<Review, 'id'>) => {
    const newReview = {
      ...review,
      id: Date.now().toString()
    };
    setReviews([...reviews, newReview]);
    setShowAddReview(false);
  };

  const addDocument = (document: Omit<Document, 'id' | 'uploadDate'>) => {
    const newDocument = {
      ...document,
      id: Date.now().toString(),
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setDocuments([...documents, newDocument]);
  };

  const addIncident = (incident: Omit<Incident, 'id'>) => {
    const newIncident = {
      ...incident,
      id: Date.now().toString()
    };
    setIncidents([...incidents, newIncident]);
    setShowAddIncident(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, employeeId: string, category: string, description: string) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = e.target?.result as string;
        addDocument({
          employeeId,
          fileName: file.name,
          fileType: file.type,
          category: category as Document['category'],
          description,
          fileData
        });
        setShowUploadDoc(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.firstName} ${emp.lastName} ${emp.position} ${emp.department}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const EmployeeForm: React.FC<{ employee?: Employee | null; onSave: (employee: Employee | Omit<Employee, 'id'>) => void; onCancel: () => void }> = ({ employee, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
      firstName: employee?.firstName || '',
      lastName: employee?.lastName || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      position: employee?.position || '',
      department: employee?.department || '',
      startDate: employee?.startDate || '',
      salary: employee?.salary || '',
      status: employee?.status || 'Active',
      emergencyContact: {
        name: employee?.emergencyContact.name || '',
        phone: employee?.emergencyContact.phone || '',
        relationship: employee?.emergencyContact.relationship || ''
      }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (employee) {
        onSave({ ...formData, id: employee.id });
      } else {
        onSave(formData);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">{employee ? 'Edit Employee' : 'Add New Employee'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as Employee['status']})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="text-md font-semibold mb-3">Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="emergencyName">Name</Label>
                  <Input
                    id="emergencyName"
                    value={formData.emergencyContact.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: {...formData.emergencyContact, name: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: {...formData.emergencyContact, phone: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyRelationship">Relationship</Label>
                  <Input
                    id="emergencyRelationship"
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: {...formData.emergencyContact, relationship: e.target.value}
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
              <Button type="submit">{employee ? 'Update' : 'Add'} Employee</Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const DocumentUploadModal: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
    const [employeeId, setEmployeeId] = useState('');
    const [category, setCategory] = useState<Document['category']>('Other');
    const [description, setDescription] = useState('');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="employee">Employee</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as Document['category'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Certificate">Certificate</SelectItem>
                  <SelectItem value="Performance">Performance</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the document"
              />
            </div>
            <div>
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => {
                  if (employeeId && category && description) {
                    handleFileUpload(e, employeeId, category, description);
                  } else {
                    alert('Please fill in all fields before selecting a file.');
                  }
                }}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">HR Management System</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
          
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Users },
              { id: 'employees', label: 'Employees', icon: Users },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'incidents', label: 'Incidents', icon: AlertCircle }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{employees.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {employees.filter(emp => emp.status === 'Active').length} active
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reviews</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reviews.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {reviews.filter(rev => new Date(rev.reviewDate).getFullYear() === new Date().getFullYear()).length} this year
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Documents</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{documents.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {documents.filter(doc => doc.category === 'Medical').length} medical
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {incidents.filter(inc => inc.status === 'Open' || inc.status === 'In Progress').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {incidents.filter(inc => inc.severity === 'High' || inc.severity === 'Critical').length} high priority
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest HR activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map(review => (
                      <div key={review.id} className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Performance review completed</p>
                          <p className="text-xs text-gray-500">{getEmployeeName(review.employeeId)} - {review.reviewDate}</p>
                        </div>
                      </div>
                    ))}
                    {incidents.slice(0, 2).map(incident => (
                      <div key={incident.id} className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${incident.severity === 'High' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">New incident reported</p>
                          <p className="text-xs text-gray-500">{getEmployeeName(incident.employeeId)} - {incident.incidentDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common HR tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={() => setShowAddEmployee(true)} className="h-20 flex flex-col space-y-2">
                      <Plus className="h-6 w-6" />
                      <span>Add Employee</span>
                    </Button>
                    <Button onClick={() => setShowAddReview(true)} variant="outline" className="h-20 flex flex-col space-y-2">
                      <Star className="h-6 w-6" />
                      <span>Add Review</span>
                    </Button>
                    <Button onClick={() => setShowUploadDoc(true)} variant="outline" className="h-20 flex flex-col space-y-2">
                      <Upload className="h-6 w-6" />
                      <span>Upload Doc</span>
                    </Button>
                    <Button onClick={() => setShowAddIncident(true)} variant="outline" className="h-20 flex flex-col space-y-2">
                      <AlertCircle className="h-6 w-6" />
                      <span>Report Incident</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Employees</h2>
              <Button onClick={() => setShowAddEmployee(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map(employee => (
                <Card key={employee.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{employee.firstName} {employee.lastName}</CardTitle>
                        <CardDescription>{employee.position}</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingEmployee(employee)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteEmployee(employee.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Department:</strong> {employee.department}</p>
                      <p><strong>Email:</strong> {employee.email}</p>
                      <p><strong>Phone:</strong> {employee.phone}</p>
                      <p><strong>Start Date:</strong> {employee.startDate}</p>
                      <p><strong>Status:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          employee.status === 'Active' ? 'bg-green-100 text-green-800' :
                          employee.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {employee.status}
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Performance Reviews</h2>
              <Button onClick={() => setShowAddReview(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Review
              </Button>
            </div>

            <div className="space-y-4">
              {reviews.map(review => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{getEmployeeName(review.employeeId)}</CardTitle>
                        <CardDescription>{review.reviewType} Review - {review.reviewDate}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${star <= review.overallRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{review.overallRating}/5</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Performance Ratings</h4>
                        <ul className="space-y-1">
                          {Object.entries(review.performance).map(([key, value]) => (
                            <li key={key} className="flex justify-between">
                              <span className="capitalize">{key}:</span>
                              <span>{value}/5</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Achievements</h4>
                        <p className="text-gray-600">{review.achievements || 'No achievements noted'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Areas for Improvement</h4>
                        <p className="text-gray-600">{review.areasForImprovement || 'No areas specified'}</p>
                      </div>
                    </div>
                    {review.comments && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium mb-2">Comments</h4>
                        <p className="text-gray-600">{review.comments}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Documents</h2>
              <Button onClick={() => setShowUploadDoc(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>

            <div className="space-y-4">
              {documents.map(doc => (
                <Card key={doc.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <h3 className="font-medium">{doc.fileName}</h3>
                        <p className="text-sm text-gray-500">
                          {getEmployeeName(doc.employeeId)} • {doc.category} • {doc.uploadDate}
                        </p>
                        <p className="text-sm text-gray-600">{doc.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        doc.category === 'Medical' ? 'bg-red-100 text-red-800' :
                        doc.category === 'Contract' ? 'bg-blue-100 text-blue-800' :
                        doc.category === 'Certificate' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {doc.category}
                      </span>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Incidents</h2>
              <Button onClick={() => setShowAddIncident(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Report Incident
              </Button>
            </div>

            <div className="space-y-4">
              {incidents.map(incident => (
                <Card key={incident.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{getEmployeeName(incident.employeeId)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            incident.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                            incident.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                            incident.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {incident.severity}
                          </span>
                        </CardTitle>
                        <CardDescription>{incident.incidentType} - {incident.incidentDate}</CardDescription>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        incident.status === 'Open' ? 'bg-red-100 text-red-800' :
                        incident.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        incident.status === 'Resolved' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {incident.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-gray-600">{incident.description}</p>
                      </div>
                      {incident.actionTaken && (
                        <div>
                          <h4 className="font-medium mb-2">Action Taken</h4>
                          <p className="text-gray-600">{incident.actionTaken}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Reported by:</span>
                          <p className="text-gray-600">{incident.reportedBy}</p>
                        </div>
                        {incident.witnesses && (
                          <div>
                            <span className="font-medium">Witnesses:</span>
                            <p className="text-gray-600">{incident.witnesses}</p>
                          </div>
                        )}
                        {incident.followUpDate && (
                          <div>
                            <span className="font-medium">Follow-up Date:</span>
                            <p className="text-gray-600">{incident.followUpDate}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {(showAddEmployee || editingEmployee) && (
        <EmployeeForm
          employee={editingEmployee}
          onSave={editingEmployee ? updateEmployee : addEmployee}
          onCancel={() => {
            setShowAddEmployee(false);
            setEditingEmployee(null);
          }}
        />
      )}

      {showAddReview && (
        <ReviewForm
          onSave={addReview}
          onCancel={() => setShowAddReview(false)}
        />
      )}

      {showAddIncident && (
        <IncidentForm
          onSave={addIncident}
          onCancel={() => setShowAddIncident(false)}
        />
      )}

      {showUploadDoc && (
        <DocumentUploadModal
          onCancel={() => setShowUploadDoc(false)}
        />
      )}
    </div>
  );
};

// Missing components - adding them here
const ReviewForm: React.FC<{ onSave: (review: Omit<Review, 'id'>) => void; onCancel: () => void }> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Review, 'id'>>({
    employeeId: '',
    reviewDate: new Date().toISOString().split('T')[0],
    reviewType: 'Annual',
    overallRating: 3,
    performance: {
      quality: 3,
      productivity: 3,
      communication: 3,
      teamwork: 3,
      leadership: 3
    },
    goals: '',
    achievements: '',
    areasForImprovement: '',
    comments: '',
    reviewerId: 'HR Manager',
    nextReviewDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Add Performance Review</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reviewType">Review Type</Label>
              <Select value={formData.reviewType} onValueChange={(value) => setFormData({...formData, reviewType: value as Review['reviewType']})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Annual">Annual</SelectItem>
                  <SelectItem value="Mid-Year">Mid-Year</SelectItem>
                  <SelectItem value="Probation">Probation</SelectItem>
                  <SelectItem value="90-Day">90-Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reviewDate">Review Date</Label>
              <Input
                id="reviewDate"
                type="date"
                value={formData.reviewDate}
                onChange={(e) => setFormData({...formData, reviewDate: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-md font-semibold mb-3">Performance Ratings (1-5 scale)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(formData.performance).map(([key, value]) => (
                <div key={key}>
                  <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}: {value}</Label>
                  <Input
                    id={key}
                    type="range"
                    min="1"
                    max="5"
                    value={value}
                    onChange={(e) => setFormData({
                      ...formData,
                      performance: {...formData.performance, [key]: parseInt(e.target.value)}
                    })}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="overallRating">Overall Rating: {formData.overallRating}</Label>
            <Input
              id="overallRating"
              type="range"
              min="1"
              max="5"
              value={formData.overallRating}
              onChange={(e) => setFormData({...formData, overallRating: parseInt(e.target.value)})}
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="achievements">Key Achievements</Label>
            <Textarea
              id="achievements"
              value={formData.achievements}
              onChange={(e) => setFormData({...formData, achievements: e.target.value})}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Add Review</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const IncidentForm: React.FC<{ onSave: (incident: Omit<Incident, 'id'>) => void; onCancel: () => void }> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Incident, 'id'>>({
    employeeId: '',
    incidentDate: new Date().toISOString().split('T')[0],
    incidentType: 'Other',
    severity: 'Medium',
    description: '',
    actionTaken: '',
    status: 'Open',
    reportedBy: 'HR Manager',
    witnesses: '',
    followUpDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Report Incident</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="incidentDate">Incident Date</Label>
              <Input
                id="incidentDate"
                type="date"
                value={formData.incidentDate}
                onChange={(e) => setFormData({...formData, incidentDate: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="incidentType">Incident Type</Label>
              <Select value={formData.incidentType} onValueChange={(value) => setFormData({...formData, incidentType: value as Incident['incidentType']})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disciplinary">Disciplinary</SelectItem>
                  <SelectItem value="Safety">Safety</SelectItem>
                  <SelectItem value="Harassment">Harassment</SelectItem>
                  <SelectItem value="Attendance">Attendance</SelectItem>
                  <SelectItem value="Performance">Performance</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select value={formData.severity} onValueChange={(value) => setFormData({...formData, severity: value as Incident['severity']})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value as Incident['status']})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Report Incident</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HRManagementApp;
