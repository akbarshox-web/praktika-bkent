// Kurslar uchun oddiy namuna (Model bo'lmasa shunday massiv ishlatsa bo'ladi)
let courses = [
    { id: 1, title: "Node.js Backend", price: 100 },
    { id: 2, title: "React Frontend", price: 80 }
];

export const getCourses = (req, res) => {
    res.json(courses);
};

export const createCourse = (req, res) => {
    const { title, price } = req.body;
    const newCourse = { id: courses.length + 1, title, price };
    courses.push(newCourse);
    res.status(201).json({ message: "Kurs qo'shildi", course: newCourse });
};

export const deleteCourse = (req, res) => {
    const { id } = req.params;
    courses = courses.filter(c => c.id !== parseInt(id));
    res.json({ message: "Kurs o'chirildi" });
};

export const updateCourse = (req, res) => {
    const { id } = req.params;
    const { title, price } = req.body;
    const index = courses.findIndex(c => c.id === parseInt(id));
    if (index !== -1) {
        courses[index] = { ...courses[index], title, price };
        return res.json({ message: "Kurs o'zgartirildi", course: courses[index] });
    }
    res.status(404).json({ message: "Kurs topilmadi" });
};